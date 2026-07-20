import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timezone
from bson import ObjectId
import hashlib

# Load .env from the same folder as this file
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── MongoDB Connection ────────────────────────────────────────────────────────
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise RuntimeError("MONGO_URI not set in backend/.env")

client = MongoClient(MONGO_URI)
db = client['Chikitsak_DB']

# Collection names exactly as in your Atlas database
hospitals_col    = db['hospitals']       # login / signup data + hospital_id
hospital_info_col = db['hospitals_info'] # beds, ICU, ventilators, doctors, crowd, timestamp

# ── Helpers ───────────────────────────────────────────────────────────────────
def utc_now():
    return datetime.now(timezone.utc).isoformat()

def bson_to_dict(doc):
    """Convert a MongoDB document to a JSON-safe dict."""
    if doc is None:
        return None
    doc['_id'] = str(doc['_id'])
    return doc


# ─────────────────────────────────────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    """Lightweight ping endpoint for uptime monitors"""
    return jsonify({"status": "ok", "service": "chikitsak-doctor-backend"}), 200

@app.route('/api/register', methods=['POST'])
def register_hospital():
    """Register a new hospital. Expects: hospital_id, name, password, email, location."""
    try:
        data = request.json or {}
        hospital_id = data.get('hospital_id', '').strip()
        name        = data.get('name', '').strip()
        password    = data.get('password', '')   # already hashed by frontend
        email       = data.get('email', '').strip()
        location    = data.get('location', '').strip()
        latitude    = data.get('latitude')
        longitude   = data.get('longitude')

        if not hospital_id or not password:
            return jsonify({"error": "hospital_id and password are required"}), 400

        if hospitals_col.find_one({"hospital_id": hospital_id}):
            return jsonify({"error": "Hospital ID already registered"}), 409

        hospitals_col.insert_one({
            "hospital_id": hospital_id,
            "name":        name,
            "email":       email,
            "password":    password,
            "location":    location,
            "created_at":  utc_now()
        })

        # Bootstrap an empty hospitals_info document for this hospital
        if not hospital_info_col.find_one({"hospital_id": hospital_id}):
            hospital_info_col.insert_one({
                "hospital_id":    hospital_id,
                "name":           name,
                "email":          email,
                "location":       location,
                "latitude":       latitude,
                "longitude":      longitude,
                "phone":          "",
                "tagline":        "",
                "available_beds": 0,
                "icu_beds":       0,
                "ventilators":    0,
                "ambulances":     0,
                "crowd_level":    "Low",
                "emergency_status": "Normal",
                "doctors":        [],
                "last_updated":   utc_now()
            })

        return jsonify({"message": "Registration successful", "hospital_id": hospital_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/login', methods=['POST'])
def login():
    """Login hospital staff. Expects: hospital_id, password (hashed by frontend)."""
    try:
        data = request.json or {}
        hospital_id = data.get('hospital_id', '').strip()
        password    = data.get('password', '')

        if not hospital_id or not password:
            return jsonify({"error": "hospital_id and password are required"}), 400

        hospital = hospitals_col.find_one({"hospital_id": hospital_id, "password": password})

        if hospital:
            return jsonify({
                "message":     "Login successful",
                "hospital_id": hospital_id,
                "name":        hospital.get("name", ""),
                "email":       hospital.get("email", ""),
                "role":        "hospital"
            }), 200
        else:
            return jsonify({"error": "Invalid Hospital ID or Password"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# HOSPITAL INFO – Resources, Crowd Level, Status
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/api/hospital/<hospital_id>/info', methods=['GET'])
def get_hospital_info(hospital_id):
    """Get real-time resource data + doctors for a hospital."""
    try:
        info = hospital_info_col.find_one({"hospital_id": hospital_id})
        if not info:
            return jsonify({"error": "Hospital info not found"}), 404
        return jsonify(bson_to_dict(info)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/hospital/<hospital_id>/resources', methods=['PUT'])
def update_resources(hospital_id):
    """Update beds, ICU beds, ventilators, ambulances, crowd level, emergency status."""
    try:
        data = request.json or {}

        allowed_fields = [
            'available_beds', 'icu_beds', 'ventilators',
            'ambulances', 'crowd_level', 'emergency_status'
        ]
        update = {k: data[k] for k in allowed_fields if k in data}
        update['last_updated'] = utc_now()

        result = hospital_info_col.update_one(
            {"hospital_id": hospital_id},
            {"$set": update},
            upsert=True
        )

        return jsonify({
            "message":      "Resources updated successfully",
            "last_updated": update['last_updated']
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# DOCTORS – managed inside hospitals_info.doctors array
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/api/hospital/<hospital_id>/doctors', methods=['GET'])
def get_doctors(hospital_id):
    """Get all doctors for a hospital."""
    try:
        info = hospital_info_col.find_one({"hospital_id": hospital_id}, {"doctors": 1})
        if not info:
            return jsonify({"doctors": []}), 200
        return jsonify({"doctors": info.get("doctors", [])}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/hospital/<hospital_id>/doctors', methods=['POST'])
def add_doctor(hospital_id):
    """Add a new doctor to the hospital. Expects: name, specialization, email, status."""
    try:
        data = request.json or {}
        name           = data.get('name', '').strip()
        specialization = data.get('specialization', '').strip()
        email          = data.get('email', '').strip()
        status         = data.get('status', 'On Duty')

        if not name or not specialization:
            return jsonify({"error": "name and specialization are required"}), 400

        doctor = {
            "doctor_id":      str(ObjectId()),
            "name":           name,
            "specialization": specialization,
            "email":          email,
            "status":         status,
            "added_at":       utc_now()
        }

        hospital_info_col.update_one(
            {"hospital_id": hospital_id},
            {
                "$push":  {"doctors": doctor},
                "$set":   {"last_updated": utc_now()}
            },
            upsert=True
        )

        return jsonify({"message": "Doctor added", "doctor": doctor}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/hospital/<hospital_id>/doctors/<doctor_id>', methods=['PUT'])
def update_doctor(hospital_id, doctor_id):
    """Update a doctor's status or details. Expects: status (and optionally name, specialization, email)."""
    try:
        data = request.json or {}

        # Build the update for array element matching
        set_fields = {}
        for field in ['name', 'specialization', 'email', 'status']:
            if field in data:
                set_fields[f"doctors.$.{field}"] = data[field]

        if not set_fields:
            return jsonify({"error": "No fields to update"}), 400

        set_fields['last_updated'] = utc_now()

        result = hospital_info_col.update_one(
            {"hospital_id": hospital_id, "doctors.doctor_id": doctor_id},
            {"$set": set_fields}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Doctor not found"}), 404

        return jsonify({"message": "Doctor updated"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/hospital/<hospital_id>/doctors/<doctor_id>', methods=['DELETE'])
def delete_doctor(hospital_id, doctor_id):
    """Remove a doctor from the hospital."""
    try:
        result = hospital_info_col.update_one(
            {"hospital_id": hospital_id},
            {
                "$pull": {"doctors": {"doctor_id": doctor_id}},
                "$set":  {"last_updated": utc_now()}
            }
        )
        if result.matched_count == 0:
            return jsonify({"error": "Hospital not found"}), 404
        return jsonify({"message": "Doctor removed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────────
# HOSPITAL PROFILE – contact info and settings
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/api/hospital/<hospital_id>/profile', methods=['GET'])
def get_profile(hospital_id):
    """Return the hospital's editable profile fields."""
    try:
        hospital = hospitals_col.find_one({"hospital_id": hospital_id}, {"_id": 0, "password": 0})
        if not hospital:
            return jsonify({"error": "Hospital not found"}), 404
        return jsonify(hospital), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/hospital/<hospital_id>/profile', methods=['PUT'])
def update_profile(hospital_id):
    """Update hospital profile: name, email, location, phone, tagline, latitude, longitude."""
    try:
        data = request.json or {}
        allowed = ['name', 'email', 'location', 'phone', 'tagline', 'latitude', 'longitude']
        update = {k: data[k] for k in allowed if k in data}
        
        # Cast to float if they exist
        for f in ['latitude', 'longitude']:
            if f in update and update[f] is not None:
                try:
                    update[f] = float(update[f])
                except ValueError:
                    return jsonify({"error": f"Invalid format for {f}"}), 400

        update['updated_at'] = utc_now()

        # Isolate fields meant for the hospitals collection
        hospitals_core_allowed = ['name', 'email', 'location', 'phone', 'tagline']
        core_update = {k: update[k] for k in hospitals_core_allowed if k in update}
        if 'updated_at' in update:
            core_update['updated_at'] = update['updated_at']

        result = hospitals_col.update_one(
            {"hospital_id": hospital_id},
            {"$set": core_update}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Hospital not found"}), 404

        # Mirror these exact fields into `hospitals_info` to avoid manual database joins
        hospital_info_col.update_one(
            {"hospital_id": hospital_id},
            {"$set": update}
        )

        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    # Render injects PORT automatically; fall back to FLASK_PORT for local dev
    port = int(os.getenv('PORT', os.getenv('FLASK_PORT', 5001)))
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    print(f"🚀 Chikitsak Doctor Backend running on http://0.0.0.0:{port}")
    app.run(debug=debug, host="0.0.0.0", port=port)
