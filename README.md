# MediFusion

FastAPI + Vite/React reference app for **medical document intelligence** (OCR → NER/structuring → patient review & chat).  
This README shows local dev, prod deploy (Uvicorn + Nginx), environment variables, and the project map.

---

## 🏗️ Tech Stack

**Backend**
- FastAPI (ASGI)
- SQLAlchemy (DB session helpers)
- AWS Textract + S3 (OCR + storage)
- OpenAI (NER & chat)
- Python 3.10+ recommended (tested with 3.12)

**Frontend**
- React (Vite + TypeScript)
- Tailwind / shadcn-ui + MUI (component mix)

---

## 📁 Repo Structure

```
medifusion-main/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app; mounts routers
│   │   ├── requirements.txt        # backend deps
│   │   ├── routes/                 # API routers
│   │   │   ├── ingestion.py        # /api/ingestion  (file upload → OCR → NER)
│   │   │   ├── ner_routes.py       # /api/ner        (NER endpoints)
│   │   │   ├── matching.py         # /api/matching   (fuzzy + patient match)
│   │   │   ├── patient.py          # /api            (patient list/CRUD-ish)
│   │   │   ├── review.py           # /api/review     (human review updates)
│   │   │   ├── chat.py             # /api/chat       (context ingest + Q&A)
│   │   │   ├── health.py           # /api/health     (ping/healthcheck)
│   │   │   └── extraction.py       # (aux extraction helpers)
│   │   └── services/               # OCR/NER/chat/etc
│   │       ├── ocr_service.py
│   │       ├── ner_openai_service.py
│   │       ├── extract_text_and_analyze_openai.py
│   │       ├── chatbot_service.py
│   │       ├── patient_service.py
│   │       ├── cleaning_service.py
│   │       ├── embedding_service.py
│   │       └── patient_matcher.py
│   └── database/
│       ├── database.py             # SessionLocal, DATABASE_URL
│       ├── db.py                   # convenience exports (if any)
│       ├── models.py               # (partial models; Postgres JSON/UUID variants)
│       ├── schemas.py              # Pydantic schemas
│       ├── patient_repository.py
│       ├── patient_context_repository.py
│       └── feedback_repository.py
└── frontend/
    ├── package.json                # vite/react/ts
    ├── src/                        # pages, components, store
    └── index.html
```

> Note: `backend/app/__init__.py` exists so **`app` is a package**. Always run Uvicorn from the `backend/` level as `uvicorn app.main:app` to keep imports like `from app.routes...` working.

---

## 🔑 Environment Variables

Create `backend/.env` (or export in your shell). Minimum set:

```env
# Database (SQLAlchemy URL)
DATABASE_URL=postgresql+psycopg2://USER:PASS@HOST:5432/medifusion

# OpenAI
OPENAI_API_KEY=sk-...

# AWS (OCR via Textract + file storage)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1          # or your region
S3_BUCKET=your-s3-bucket-name
```

Optional / Nice-to-have:
```env
# Model choices if you add switches in code later
OPENAI_MODEL=gpt-4o-mini             # example
```

---

## 🧰 Backend: Setup & Run (Dev)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate

pip install -r app/requirements.txt
cp .env.example .env  # if you add one; else create .env with vars above
```

Run the API (from **backend/** to keep imports stable):

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Docs: http://localhost:8000/docs
- Health (if enabled): `GET /api/health`

> If you run from `backend/app/`, you must switch imports to relative (e.g., `from routes.ingestion import ...`). Recommended approach is to **stay in `backend/`** and keep absolute imports `from app.routes...`.

---

## 🧪 Quick Endpoint Map (high-level)

- **`POST /api/ingestion/upload`**  
  Accepts files (pdf/images/zip). Uploads to **S3**, runs **Textract**, aggregates text, then calls OpenAI NER to return structured patient JSON.

- **`POST /api/ner/extract`**  
  Runs NER on plain text or file content; returns `StructuredPatientInput` JSON.

- **`GET /api/patients`**, **`PUT /api/patients/{id}`**  
  Basic list/update endpoints backed by SQLAlchemy sessions.

- **`POST /api/review`**  
  Accepts human-reviewed patient payload and merges with existing patient records.

- **`POST /api/chat/ingest_context`**  
  Store per-patient context (JSON) for later Q&A.

- **`POST /api/chat/ask`**  
  Answer a question using stored context + OpenAI, maintains short chat history.

- **`GET /api/matching/fuzzy`**  
  Fuzzy search/match helpers (e.g., name/address similarity).

> Exact function names/paths may differ slightly; see files under `backend/app/routes/` for precise signatures and payloads.

---

## 🌐 Frontend: Setup & Run

```bash
cd frontend
npm ci            # or: npm install
npm run dev       # Vite dev server (default http://localhost:5173)
```

Build for prod:
```bash
npm run build
npm run preview   # optional local preview
```

---

## 🚀 Production Deploy (Uvicorn + Nginx; no Gunicorn)

### 1) Run Uvicorn bound to a Unix socket
```bash
sudo mkdir -p /run/uvicorn
sudo chown $USER:$USER /run/uvicorn

# from backend/
uvicorn app.main:app   --uds /run/uvicorn/medifusion.sock   --workers 4   --proxy-headers
```

### 2) Nginx site (example)
```
upstream medifusion_backend {
    server unix:/run/uvicorn/medifusion.sock;
}

server {
    listen 80;
    server_name medifusion.example.com;

    # Serve built frontend (copy frontend/dist to this directory)
    root /var/www/medifusion-frontend;
    index index.html;

    location /api/ {
        proxy_pass http://medifusion_backend;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 180s;
        proxy_send_timeout 180s;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
```

### 3) Systemd service (optional)

Create `/etc/systemd/system/medifusion-uvicorn.service`:

```
[Unit]
Description=Uvicorn for MediFusion
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/medifusion/backend
Environment="PATH=/opt/medifusion/.venv/bin"
RuntimeDirectory=uvicorn
RuntimeDirectoryMode=0755
ExecStart=/opt/medifusion/.venv/bin/uvicorn app.main:app --uds /run/uvicorn/medifusion.sock --workers 4 --proxy-headers
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl daemon-reload
sudo systemctl enable medifusion-uvicorn
sudo systemctl start medifusion-uvicorn
```

---

## ❗ Troubleshooting

- **`ModuleNotFoundError: No module named 'app'`**  
  Run Uvicorn from `backend/` level: `uvicorn app.main:app`. Confirm `backend/app/__init__.py` exists.

- **AWS errors**  
  Ensure `S3_BUCKET`, `AWS_*` vars are set and the role/key has Textract + S3 permissions.

- **OpenAI errors**  
  Check `OPENAI_API_KEY` and model availability in your region. Rate limits can cause 429s.

- **DB connection**  
  Set a reachable `DATABASE_URL`. If using Postgres locally, ensure service is up and library `psycopg2` is installed.

---

## ✅ Dev Notes / Next Steps

- `database/models.py` is partial; extend your tables as needed.
- Consider centralizing settings in `pydantic.BaseSettings` instead of raw `os.getenv`.
- Add request/response models to route docstrings for clearer `/docs` UX.
- For heavy OCR/NER workloads, move long-running tasks to Celery/RQ workers.

---

## 🧾 License

Internal / hackathon use. Add a LICENSE file if you plan to open-source.
