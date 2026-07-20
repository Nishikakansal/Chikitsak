from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import tempfile
import math
import requests
import google.generativeai as genai
from dotenv import load_dotenv
from pymongo import MongoClient
import bcrypt
import jwt
import datetime

load_dotenv()

app = Flask(__name__)
# Allow the deployed frontend origin (and localhost for dev)
_frontend_origin = os.environ.get("FRONTEND_URL", "*")
CORS(app, origins=[_frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"])

# ─────────────────────────────────────────────
# Connect to MongoDB
# ─────────────────────────────────────────────
MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = os.environ.get("DB_NAME", "Chikitsak_DB")
try:
    mongo_client = MongoClient(MONGO_URI)
    db = mongo_client[DB_NAME]
    patients_collection = db["Patients"]
    hospitals_collection = db["Hospitals"]
    # Ensure email is unique
    patients_collection.create_index("email", unique=True)
    print(f"[MongoDB] Connected to database: {DB_NAME}, Collections: Patients, Hospitals")
except Exception as e:
    print(f"[MongoDB] Failed to connect: {e}")

# JWT Secret Key
JWT_SECRET = os.environ.get("JWT_SECRET", "super-secret-key-12345")

# ─────────────────────────────────────────────
# Configure Gemini (used for summary generation)
# ─────────────────────────────────────────────
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

# ─────────────────────────────────────────────
# Severity prediction — Hugging Face Inference API
# Model: Nishikakansal/chikitsak-triage-model (fine-tuned DistilBERT)
# ─────────────────────────────────────────────
SEVERITY_LABELS = ["LOW", "MEDIUM", "CRITICAL"]
TRIAGE_MODEL_PATH = os.environ.get("TRIAGE_MODEL_PATH", "Nishikakansal/chikitsak-triage-model")
HF_API_URL = f"https://api-inference.huggingface.co/models/{TRIAGE_MODEL_PATH}"
HF_TOKEN   = os.environ.get("HF_TOKEN", "")


def _predict_severity_gemini_fallback(text: str) -> dict:
    """Gemini-based fallback — used only if HF Inference API is unavailable."""
    prompt = f"""You are a medical triage AI. Classify the following patient symptom description.

Symptoms: "{text}"

Respond with a JSON object ONLY (no markdown, no explanation):
{{"severity": "LOW"|"MEDIUM"|"CRITICAL", "confidence": <0-100 float>, "probabilities": {{"LOW": <float>, "MEDIUM": <float>, "CRITICAL": <float>}}}}

Rules:
- CRITICAL: life-threatening (chest pain, stroke, severe bleeding, breathing difficulty, unconscious)
- MEDIUM: needs hospital within hours (moderate pain, fever >103F, fractures, infection)
- LOW: non-emergency (mild cold, minor cuts, routine concerns)
- probabilities must sum to 100"""
    response = gemini_model.generate_content(prompt)
    content = response.text.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
        content = content.strip()
    result = json.loads(content)
    severity = result.get("severity", "MEDIUM").upper()
    if severity not in SEVERITY_LABELS:
        severity = "MEDIUM"
    confidence = float(result.get("confidence", 70.0))
    probs = result.get("probabilities", {"LOW": 33.3, "MEDIUM": 33.3, "CRITICAL": 33.4})
    return {
        "severity": severity,
        "confidence": round(confidence, 1),
        "probabilities": {
            "LOW":      round(float(probs.get("LOW", 33.3)), 1),
            "MEDIUM":   round(float(probs.get("MEDIUM", 33.3)), 1),
            "CRITICAL": round(float(probs.get("CRITICAL", 33.4)), 1),
        }
    }


def predict_severity(text: str) -> dict:
    """
    Call the fine-tuned DistilBERT model (Nishikakansal/chikitsak-triage-model)
    via the Hugging Face Inference API — no local model loaded, zero extra RAM.
    Falls back to Gemini if HF is unavailable.
    Returns: { "severity": "CRITICAL"|"MEDIUM"|"LOW", "confidence": float, "probabilities": {...} }
    """
    try:
        headers = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}
        resp = requests.post(
            HF_API_URL,
            headers=headers,
            json={"inputs": text},
            timeout=30
        )
        resp.raise_for_status()
        data = resp.json()

        # HF text-classification returns [[{label, score}, ...]]
        predictions = data[0] if isinstance(data[0], list) else data

        # Labels may come as LABEL_0/1/2 or LOW/MEDIUM/CRITICAL
        label_map = {
            "LABEL_0": "LOW", "LABEL_1": "MEDIUM", "LABEL_2": "CRITICAL",
            "LOW": "LOW",     "MEDIUM": "MEDIUM",  "CRITICAL": "CRITICAL",
        }
        score_map = {sl: 0.0 for sl in SEVERITY_LABELS}
        for item in predictions:
            mapped = label_map.get(item["label"].upper())
            if mapped:
                score_map[mapped] = float(item["score"])

        predicted  = max(score_map, key=score_map.get)
        confidence = score_map[predicted]
        print(f"[HF-Triage] severity={predicted} confidence={round(confidence*100,1)}%")
        return {
            "severity":      predicted,
            "confidence":    round(confidence * 100, 1),
            "probabilities": {
                "LOW":      round(score_map["LOW"]      * 100, 1),
                "MEDIUM":   round(score_map["MEDIUM"]   * 100, 1),
                "CRITICAL": round(score_map["CRITICAL"] * 100, 1),
            }
        }

    except Exception as e:
        print(f"[HF-Triage] Inference API failed ({e}) — falling back to Gemini.")
        try:
            return _predict_severity_gemini_fallback(text)
        except Exception as e2:
            print(f"[Severity] Gemini fallback also failed ({e2}).")
            return {"severity": "MEDIUM", "confidence": 0.0,
                    "probabilities": {"LOW": 33.3, "MEDIUM": 33.4, "CRITICAL": 33.3}}


# ─────────────────────────────────────────────
# Audio transcription via Gemini 1.5 Flash
# (replaces local Whisper — no ffmpeg, no 200MB model download)
# ─────────────────────────────────────────────
def transcribe_with_gemini(audio_path: str, mime_type: str = "audio/webm") -> dict:
    """Upload audio to Gemini and return transcript + detected language."""
    print(f"[Gemini-STT] Transcribing {audio_path} ({mime_type})...")
    uploaded = genai.upload_file(audio_path, mime_type=mime_type)
    response = gemini_model.generate_content([
        uploaded,
        """Transcribe this audio exactly as spoken. 
Return a JSON object with two fields only (no markdown):
{"transcript": "<verbatim text>", "language": "<detected language name>"}"""
    ])
    content = response.text.strip()
    # Strip markdown code fences if Gemini wraps in ```json
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
        content = content.strip()
    result = json.loads(content)
    print(f"[Gemini-STT] Done — lang={result.get('language', '?')}")
    return result


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    """
    Accepts audio file from browser (multipart/form-data, field: 'audio').
    Uses Gemini 1.5 Flash for speech-to-text (no local Whisper model needed).
    """
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    # Determine MIME type from extension
    ext = os.path.splitext(audio_file.filename)[1].lower()
    mime_map = {
        '.webm': 'audio/webm',
        '.wav':  'audio/wav',
        '.mp3':  'audio/mpeg',
        '.ogg':  'audio/ogg',
        '.m4a':  'audio/mp4',
        '.mp4':  'audio/mp4',
    }
    suffix   = ext if ext in mime_map else '.webm'
    mime_type = mime_map.get(suffix, 'audio/webm')

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            audio_file.save(tmp.name)
            tmp_path = tmp.name

        result = transcribe_with_gemini(tmp_path, mime_type)
        transcript   = result.get("transcript", "").strip()
        detected_lang = result.get("language", "unknown")

        if not transcript:
            return jsonify({"error": "No speech detected. Please speak clearly."}), 422

        return jsonify({
            "transcript": transcript,
            "detected_language": detected_lang
        })

    except Exception as e:
        print(f"[Transcribe] Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass


@app.route('/api/translate', methods=['POST'])
def translate():
    """Translate non-English medical text to English using Gemini."""
    data = request.json
    text = data.get('text', '')
    source_lang = data.get('source_lang', 'en-IN')

    if not text or source_lang == 'en-IN':
        return jsonify({"translated": text})

    prompt = f"""You are a medical translator. Translate the following medical symptom description to English accurately.
Keep all medical terms intact. Do not add explanations. Return ONLY the translated English text.

Text to translate: "{text}"
"""
    try:
        response = gemini_model.generate_content(prompt)
        translated = response.text.strip().strip('"')
        return jsonify({"translated": translated, "original": text})
    except Exception as e:
        print(f"[Translate] Error: {e}")
        return jsonify({"translated": text})


@app.route('/api/triage', methods=['POST'])
def triage():
    """
    Main triage endpoint.
    Step 1: Use local DistilBERT to predict severity (fast, offline).
    Step 2: Use Gemini to generate a rich clinical summary (optional, can work without it).
    """
    data = request.json
    symptoms = data.get('symptoms', '')
    original_language = data.get('original_language', 'English')

    if not symptoms:
        return jsonify({"error": "No symptoms provided"}), 400

    # Step 1: Local model prediction (always runs)
    prediction = predict_severity(symptoms)
    severity = prediction["severity"]
    confidence = prediction["confidence"]
    probs = prediction["probabilities"]

    # Step 2: Gemini for detailed clinical explanation (falls back gracefully)
    category_map = {
        "CRITICAL": "Cardiac, Respiratory, Neurological, or Trauma",
        "MEDIUM": "Infectious, Gastrointestinal, or moderate Injury",
        "LOW": "Minor ailment or non-emergency"
    }

    try:
        prompt = f"""You are an expert emergency medical triage AI for CHIKITSAK, a hospital recommendation app in India.

A patient has described: "{symptoms}" (originally in {original_language})
Our DistilBERT model has already classified this as: {severity} severity (confidence: {confidence}%)
Likely category: {category_map.get(severity, "General")}

Respond with a JSON object ONLY (no markdown):
{{
  "summary": "2-3 sentence medical explanation of why this is {severity} severity",
  "probable_condition": "Most likely medical condition based on symptoms",
  "action_required": "Specific immediate action for the patient or bystander",
  "category": "One of: Cardiac, Respiratory, Neurological, Trauma, Infectious, Gastrointestinal, Other Critical, General"
}}"""

        response = gemini_model.generate_content(prompt)
        content = response.text.strip()
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]
        content = content.strip()
        gemini_result = json.loads(content)

        return jsonify({
            "severity": severity,
            "confidence": confidence,
            "probabilities": probs,
            "summary": gemini_result.get("summary", ""),
            "probable_condition": gemini_result.get("probable_condition", ""),
            "action_required": gemini_result.get("action_required", ""),
            "category": gemini_result.get("category", "General"),
            "model_used": "DistilBERT (local) + Gemini (summary)"
        })

    except Exception as e:
        print(f"[Triage] Gemini summary failed ({e}), returning model-only result.")
        # Fallback: return local model result with template-based explanations
        fallback_actions = {
            "CRITICAL": "Call 112 immediately. Do not move the patient unless in immediate danger.",
            "MEDIUM": "Visit the nearest hospital within the next 1-2 hours.",
            "LOW": "Visit a nearby clinic or PHC at your convenience."
        }
        return jsonify({
            "severity": severity,
            "confidence": confidence,
            "probabilities": probs,
            "summary": f"Based on the reported symptoms, our AI model assessed this as {severity} severity with {confidence}% confidence.",
            "probable_condition": "Requires clinical assessment for definitive diagnosis.",
            "action_required": fallback_actions.get(severity, "Consult a doctor."),
            "category": "General",
            "model_used": "DistilBERT (local, offline)"
        })


def haversine_km(lat1, lng1, lat2, lng2):
    """Calculate straight-line distance in km between two GPS coordinates."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def compute_hospital_score(hospital, distance_km, severity):
    """
    Cost function to rank hospitals.
    Returns a 0-100 score (higher = better / more suitable).

    Weights by severity:
      CRITICAL : distance=50%, resources=50%
      MEDIUM   : distance=30%, resources=70%
      LOW      : distance=15%, resources=85%
    """
    severity = (severity or "MEDIUM").upper()
    if severity == "CRITICAL":
        w_dist, w_res = 0.50, 0.50
    elif severity == "LOW":
        w_dist, w_res = 0.15, 0.85
    else:  # MEDIUM
        w_dist, w_res = 0.30, 0.70

    # ── Resource sub-score (0-1) ──────────────────────────────
    beds       = hospital.get("beds", {})
    icu        = hospital.get("icu_beds", {})
    vents      = hospital.get("ventilators", {})
    docs       = hospital.get("doctors", {})
    crowd      = hospital.get("crowd_level", 0.5)   # 0=empty, 1=full

    # Availability ratios (available / total), clamped 0-1
    def avail_ratio(d):
        total = d.get("total", 1) or 1
        return min(d.get("available", 0) / total, 1.0)

    bed_score   = avail_ratio(beds)        # weight 25%
    icu_score   = avail_ratio(icu)         # weight 30%
    vent_score  = avail_ratio(vents)       # weight 25%
    doc_score   = avail_ratio(docs)        # weight 20% (on_duty / total)
    crowd_score = 1 - crowd               # invert: less crowd = better

    resource_score = (
        bed_score    * 0.25 +
        icu_score    * 0.30 +
        vent_score   * 0.25 +
        doc_score    * 0.20
    ) * crowd_score  # penalise by crowd

    # ── Distance sub-score (0-1, closer = 1) ─────────────────
    max_useful_distance = 50.0  # km beyond which score → 0
    dist_score = max(0, 1 - (distance_km / max_useful_distance))

    final_score = (w_res * resource_score + w_dist * dist_score) * 100
    return round(final_score, 2)


@app.route('/api/hospitals', methods=['GET'])
def get_hospitals():
    """Return all hospitals from DB (no ranking)."""
    raw = list(hospitals_collection.find({}, {"_id": 0}))
    return jsonify(raw)


@app.route('/api/hospitals/ranked', methods=['POST'])
def get_ranked_hospitals():
    """
    Accepts: { "lat": float, "lng": float, "severity": "LOW"|"MEDIUM"|"CRITICAL" }
    Returns: hospitals sorted by computed priority score (highest first).
    """
    data = request.json or {}
    patient_lat = data.get("lat")
    patient_lng = data.get("lng")
    severity    = data.get("severity", "MEDIUM")

    hospitals_raw = list(hospitals_collection.find({}, {"_id": 0}))

    results = []
    for h in hospitals_raw:
        coords = h.get("coordinates", {})
        h_lat  = coords.get("lat")
        h_lng  = coords.get("lng")

        # Distance calculation
        if patient_lat and patient_lng and h_lat and h_lng:
            dist_km = round(haversine_km(patient_lat, patient_lng, h_lat, h_lng), 2)
            eta_min = round(dist_km / 40 * 60)  # assume avg 40 km/h in city
        else:
            dist_km = None
            eta_min = None

        score = compute_hospital_score(h, dist_km if dist_km else 10, severity)

        results.append({
            "name"          : h.get("name"),
            "address"       : h.get("address"),
            "coordinates"   : coords,
            "distance_km"   : dist_km,
            "eta_min"       : eta_min,
            "beds_available": h.get("beds", {}).get("available"),
            "icu_available" : h.get("icu_beds", {}).get("available"),
            "ventilators_available": h.get("ventilators", {}).get("available"),
            "doctors_on_duty": h.get("doctors", {}).get("on_duty"),
            "crowd_level"   : h.get("crowd_level"),
            "specializations": h.get("specializations", []),
            "emergency"     : h.get("emergency", False),
            "priority_score": score,
        })

    results.sort(key=lambda x: x["priority_score"], reverse=True)
    return jsonify(results)

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone', '')

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if patients_collection.find_one({"email": email}):
        return jsonify({"error": "User with this email already exists"}), 409

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    new_patient = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "phone": phone,
        "created_at": datetime.datetime.now(datetime.timezone.utc)
    }

    try:
        result = patients_collection.insert_one(new_patient)
        
        # Generate token
        token = jwt.encode({
            'user_id': str(result.inserted_id),
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
        }, JWT_SECRET, algorithm="HS256")

        return jsonify({
            "message": "User created successfully",
            "token": token,
            "user": {"name": name, "email": email}
        }), 201

    except Exception as e:
        print(f"[Signup Error] {e}")
        return jsonify({"error": "Could not register user"}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = patients_collection.find_one({"email": email})

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({"error": "Invalid email or password"}), 401

    # Generate token
    token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    }, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {"name": user['name'], "email": user['email']}
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
