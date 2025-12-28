# Paths
VENV        = venv
PYTHON      = $(VENV)/Scripts/python
PIP         = $(VENV)/Scripts/pip

# Default target
all:
	$(MAKE) -j2 backend frontend

# Create venv if not exists
$(VENV):
	python -m venv $(VENV)

# Install dependencies
install: $(VENV)
	cd backend && $(PIP) install -r requirements.txt
	cd frontend && npm install

# Run backend (blocking server)
backend: $(VENV)
	cd backend && ../$(PYTHON) main.py

# Run frontend (dev server)
frontend:
	cd frontend && npm run dev

.PHONY: all install backend frontend
