# NeuroVisa 🧠

NeuroVisa is a futuristic AI-powered visa interview simulator designed to help users prepare for high-stakes interviews with confidence. Using advanced behavioral telemetry and adaptive intelligence, it provides a realistic, supportive environment for practice.

## 🚀 Features

- **Neural Evaluator**: AI interviewer that adapts its follow-up questions based on your responses.
- **Spectral Capture (Voice)**: High-fidelity voice recognition with real-time waveform visualization.
- **Cognitive Diagnostics**: Real-time feedback on confidence, clarity, and consistency.
- **Analysis HUD**: Visible AI reasoning steps that show the "thinking" behind the evaluation.
- **Supportive Summaries**: Comprehensive post-interview briefings with actionable insights.

## 🛠️ Project Structure

- `frontend/`: React + Vite application with Tailwind CSS and Framer Motion.
- `backend/`: FastAPI application with SQLAlchemy and AI evaluation logic.

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.9+)

### Environment Setup

1. **Backend**:
   - `cd backend`
   - Create a `.env` file from `.env.example`:
     ```bash
     cp .env.example .env
     ```
   - Initialize virtual environment:
     ```bash
     python -m venv venv
     source venv/bin/activate  # On Windows: venv\Scripts\activate
     pip install -r requirements.txt
     ```

2. **Frontend**:
   - `cd frontend`
   - Create a `.env` file from `.env.example`:
     ```bash
     cp .env.example .env
     ```
   - Install dependencies:
     ```bash
     npm install
     ```

### Running the Project

1. **Start Backend**:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛡️ Important Disclaimer

This project is a simulation tool for preparatory purposes only. It does not provide legal advice or guarantee visa approval. Decisions are at the full discretion of the respective embassy officials.

## 🤝 Contributing

1. Clone the repository.
2. Follow the setup instructions above.
3. Ensure no secrets or tokens are committed to the codebase.
