# Blockchain Simulator with Smart Contracts
---

## English

A full-stack, decentralized dApp simulation featuring asymmetric cryptography (RSA) based wallet management and automated smart contract execution. Developed as a Software Engineering project.

### 👥 Contributors & Roles
- **Muhammed Kadir** — *Core Blockchain Logic & Smart Contract Integration*
  - Developed the PoW (Proof-of-Work) algorithm, block structure, and state validation.
  - Implemented the dynamic balance synchronization and smart contract transaction execution on the backend.
- **Barış KARAKOÇ** — *Frontend Architecture (React.js)*
  - Designed and built the React application structure.
  - Developed the UI components, modern Slate/Indigo styling, and local state persistence.
- **Selim ANAFIEV** — *RESTful API Architecture (Flask)*
  - Built the RESTful API endpoints and backend routing.
  - Managed server-client communication, CORS handling, and JSON payload structures.

### 🚀 Key Features
- **Asymmetric Wallet System:** Each user is generated with a secure RSA public/private key pair and initialized with **500 BTC**.
- **Secure Transactions:** Digitally signed, balance-checked transaction execution between addresses.
- **Smart Contracts:** Automated payment execution triggered when a condition address reaches a specific threshold.
- **PoW Mining Sim:** A Proof-of-Work mining simulator that commits transactions to the immutable ledger.
- **Security Check (Hack Simulation):** Real-time tamper detection that invalidates the chain and triggers visual alerts if block data is altered.

### 🛠️ Tech Stack
- **Backend:** Python, Flask, PyCryptodome (RSA)
- **Frontend:** React.js, React Router, Axios, Modern CSS

---

## Türkçe

Asimetrik şifreleme (RSA) tabanlı cüzdan yönetimi ve otomatik tetiklenen akıllı kontrat (Smart Contract) mimarisine sahip merkeziyetsiz bir dApp simülasyonudur. Yazılım Mühendisliği projesi kapsamında geliştirilmiştir.

### 👥 Katkıda Bulunanlar & Roller
- **Muhammed Kadir BÜK** — *Çekirdek Blok Zinciri Mantığı & Akıllı Kontrat Entegrasyonu*
  - PoW (Proof-of-Work) algoritmasını, blok yapısını ve zincir doğrulama mantığını yazdı.
  - Backend tarafında dinamik bakiye güncellemelerini ve akıllı kontratların işlem tetikleme mantığını kurdu.
- **Barış KARAKOÇ** — *Arayüz Mimarisi (React.js)*
  - React uygulama yapısını ve bileşenlerini tasarlayıp kodladı.
  - Modern Slate/Indigo CSS arayüz tasarımını ve tarayıcı yerel veri saklama (localStorage) yapısını kurdu.
- **Selim ANAFIEV** — *RESTful API Mimarisi (Flask)*
  - API uç noktalarını (endpoints) ve backend yönlendirmelerini (routing) oluşturdu.
  - Sunucu-istemci veri iletişimini, CORS ayarlarını ve JSON veri yapılarını yönetti.

### 🚀 Öne Çıkan Özellikler
- **Asimetrik Cüzdan Sistemi:** Her kullanıcı güvenli RSA açık/gizli anahtar çiftiyle üretilir ve otomatik olarak **500 BTC** başlangıç bakiyesi alır.
- **Güvenli Transferler:** Cüzdanlar arasında dijital imzalı ve bakiye kontrollü para transferleri gerçekleştirilir.
- **Akıllı Kontratlar (Smart Contracts):** Belirlenen şartlı alıcı adresi hedef miktara ulaştığında, kontratı kuran kişinin bakiyesinden otomatik ödeme tetiklenir.
- **Madencilik Simülasyonu:** Proof-of-Work (PoW) algoritması kullanılarak işlemler bloklara yazılır ve deftere kaydedilir.
- **Saldırı Simülasyonu (Hack):** Blok verileri değiştirildiğinde hash uyuşmazlığını anında yakalayan ve zinciri kırmızı alarma geçiren güvenlik sistemi.

### 🛠️ Teknolojiler
- **Backend:** Python, Flask, PyCryptodome (RSA)
- **Frontend:** React.js, React Router, Axios, Modern CSS

---

## 💻 Installation & Run / Kurulum ve Çalıştırma

### 1. Backend (Flask)
```bash
# Install cryptography and server dependencies / Kriptografi ve sunucu bağımlılıklarını yükleyin
pip install pycryptodome Flask Flask-CORS

# Start backend / Sunucuyu başlatın
python app.py

### 2. Frontend (React)
```bash
# Go to client directory / Client klasörüne geçiş yapın
cd client

# Install dependencies / Bağımlılıkları yükleyin
npm install

# Run application / Uygulamayı başlatın
npm start