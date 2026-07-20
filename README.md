# 🚑 CHIKITSAK
### AI-Powered Intelligent Emergency Hospital Recommendation System

CHIKITSAK is an AI-powered healthcare platform designed to help patients find the most suitable hospital during medical emergencies while enabling hospitals and doctors to manage their resources through a dedicated dashboard.

Instead of recommending only the nearest hospital, CHIKITSAK analyzes the patient's symptoms, predicts the severity of the condition using Natural Language Processing (NLP), and recommends a suitable hospital by considering both medical urgency and available hospital resources.

---
# 🌐 Live Demo

| Portal | Live Link |
|---------|-----------|
| 👤 Patient Portal | https://chikitsakpatient.vercel.app |
| 👨‍⚕️ Doctor Portal | https://YOUR_DOCTOR_PORTAL.vercel.app |

---

# ☁️ Deployment

| Service | Platform |
|---------|----------|
| 👤 Patient Frontend | Vercel |
| 👨‍⚕️ Doctor Frontend | Vercel |
| ⚙️ Patient Backend | Render |
| ⚙️ Doctor Backend | Render |
| 🤖 AI Model | Hugging Face |
| 🗄️ Database | MongoDB Atlas |

---

## 📌 Problem Statement

During emergencies, people often choose the nearest hospital without knowing whether it has the required facilities, such as ICU beds, specialists, available beds, or ventilators.

This can result in:

- Delays in treatment
- Unnecessary patient transfers
- Loss of the critical Golden Hour
- Poor emergency decision-making

CHIKITSAK addresses this problem by providing intelligent hospital recommendations based on both the patient's condition and hospital readiness.

---

## ✨ Key Features

### 👤 Patient Portal

- Voice and text-based symptom input
- AI-powered emergency severity prediction
- Intelligent hospital recommendations
- Hospital details and resource availability
- User authentication and profile management
- User-friendly responsive interface

### 🩺 Doctor / Hospital Portal

- Dedicated doctor and hospital dashboard
- Doctor authentication
- Patient management
- Appointment management
- Hospital resource management
- Dashboard for monitoring hospital information and availability

### 🤖 AI Capabilities

- Fine-tuned DistilBERT model for symptom severity classification
- Speech-to-text support for voice-based symptom input
- AI-assisted healthcare features
- Smart hospital recommendation logic

---

## 🖥️ System Workflow

```text
Patient
   │
   ▼
Voice / Text Symptoms
   │
   ▼
Speech-to-Text (if voice)
   │
   ▼
DistilBERT Severity Prediction
   │
   ▼
Severity Level
(Low / Medium / Critical)
   │
   ▼
Hospital Recommendation Engine
   │
   ▼
Hospital Resource Evaluation
   │
   ▼
Best Hospital Recommendation
```

The Doctor/Hospital Portal allows hospital information and resources to be managed separately while using the shared CHIKITSAK database.

---

## 🧠 AI Model

CHIKITSAK uses **DistilBERT**, a transformer-based Natural Language Processing model fine-tuned for emergency symptom severity classification.

### Input

Natural-language symptom description:

```text
I have severe chest pain and difficulty breathing.
```

### Output

```text
Severity: Critical
```

### Severity Classes

| Label | Severity |
|------:|----------|
| 0 | Low |
| 1 | Medium |
| 2 | Critical |

The trained model is hosted separately on **Hugging Face** and is loaded by the backend when required. Large model weight files are not stored directly in this GitHub repository.

---

## 🏥 Hospital Recommendation Logic

Instead of recommending a hospital based only on distance, CHIKITSAK considers multiple factors that can affect emergency treatment.

The recommendation system can evaluate factors such as:

- Distance
- Estimated travel time
- ICU availability
- Bed availability
- Doctor availability
- Ventilator availability
- Hospital crowd level

The system uses these factors along with the predicted severity of the patient's condition to recommend a suitable hospital.

---

## 📂 Dataset

The AI model was trained on a custom emergency symptom classification dataset containing:

- 1,200+ symptom entries
- Multiple emergency categories
- Three severity classes

### Emergency Categories

- Cardiac
- Respiratory
- Neurological
- Trauma
- Gastrointestinal
- Infection
- Burns
- Poisoning

### Training Approach

- Fine-tuned DistilBERT
- Supervised learning
- Validation monitoring
- Early stopping
- Three-class severity classification

---

## 💻 Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Flask
- Python

### Database

- MongoDB

### Artificial Intelligence / Machine Learning

- DistilBERT
- Hugging Face Transformers
- PyTorch
- Gemini API
- Whisper / Speech Recognition

---

## 🏗️ Project Structure

```text
CHIKITSAK/
│
├── patient/
│   ├── backend/
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   ├── .env.example
│   │   └── upload_model.py
│   │
│   ├── public/
│   ├── src/
│   │   └── components/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── doctor/
│   ├── backend/
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   └── .env.example
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Nishikakansal/CHIKITSAK.git
cd CHIKITSAK
```

---

## 👤 Run the Patient Portal

### Patient Backend

```bash
cd patient/backend
python -m venv venv
```

On Windows:

```bash
venv\Scripts\activate
```

Install the dependencies:

```bash
python -m pip install -r requirements.txt
```

Create a `.env` file using `.env.example` as a reference, then run:

```bash
python app.py
```

### Patient Frontend

Open another terminal:

```bash
cd patient
npm install
npm run dev
```

---

## 🩺 Run the Doctor Portal

### Doctor Backend

```bash
cd doctor/backend
python -m venv venv
```

On Windows:

```bash
venv\Scripts\activate
```

Install the dependencies:

```bash
python -m pip install -r requirements.txt
```

Create a `.env` file using `.env.example` as a reference, then run:

```bash
python app.py
```

### Doctor Frontend

Open another terminal:

```bash
cd doctor
npm install
npm run dev
```

---

## 🔐 Environment Variables

Real `.env` files are not committed to the repository.

Use the provided `.env.example` files to configure the application:

```text
patient/.env.example
patient/backend/.env.example

doctor/.env.example
doctor/backend/.env.example
```

Never commit API keys, database credentials, JWT secrets, or other sensitive credentials to GitHub.

---

## 🚀 Future Scope

- Multilingual voice support
- Live ambulance tracking
- Integration with live traffic and navigation data
- Real-time hospital API integration
- Wearable health device integration
- Electronic Health Record (EHR) support
- Advanced emergency prioritization
- Real-time synchronization of hospital resources

---

## ⚠️ Disclaimer

CHIKITSAK is an educational and research-oriented project. Its AI-generated severity predictions and hospital recommendations should not be considered a substitute for professional medical advice, diagnosis, or emergency services.

In a medical emergency, users should contact their local emergency services immediately.

---

## ⭐ Support

If you found this project useful, consider giving the repository a star!
