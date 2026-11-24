# Mellow Hair Store

เว็บไซต์ขายแชมพู Mellow Hair มีสินค้า 2 SKU ตามไฟล์ฐานข้อมูลที่ให้มา

## ไฟล์ในโปรเจกต์
- `index.html`, `style.css`, `app.js` — หน้าเว็บไซต์และแบบฟอร์มสั่งซื้อ
- `assets/` — ภาพประกอบสินค้า SVG (สามารถเปลี่ยนเป็นรูปสินค้าจริงได้)
- `google-apps-script/Code.gs` — โค้ดเชื่อม Google Sheets เพื่ออ่านสินค้า บันทึกออเดอร์ ลดสต็อก และแสดงรายการเตรียมจัดส่ง

## ขั้นตอนใช้งาน
1. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้เข้า GitHub repository โดยให้ `index.html` อยู่ระดับบนสุด
2. เปิด Google Sheets ของคุณ แล้วเลือก Extensions > Apps Script
3. ลบโค้ดเดิม แล้วคัดลอกโค้ดจาก `google-apps-script/Code.gs` ไปวาง จากนั้น Save
4. Deploy > New deployment > เลือกประเภท Web app
   - Execute as: Me
   - Who has access: Anyone
   - กด Deploy และอนุญาตสิทธิ์ตามขั้นตอน
5. คัดลอก Web app URL ที่ลงท้ายด้วย `/exec` แล้วเปิด `app.js` ใน GitHub กดดินสอ Edit แล้วแทนข้อความ `ใส่_URL_WEB_APP_ของคุณที่นี่` ใน `API_URL` ด้วย URL นั้น
6. Commit changes
7. เข้า Vercel แล้ว Import โปรเจกต์จาก GitHub repository นี้ โดย Framework Preset เลือก Other และ Deploy

## ข้อควรทราบ
- Google Sheets ต้องมีหัวตารางตามนี้: `SKU`, `Product Name`, `Description`, `Price (THB)`, `Stock`, `Image`
- โค้ดรองรับชื่อแท็บ `Products` หรือชื่อเดิม `roducts`
- เมื่อมีออเดอร์ ระบบจะสร้างแท็บ `Orders` อัตโนมัติและลดสต็อก
- ส่วนรายการเตรียมจัดส่งมีปุ่มพิมพ์ใบปะหน้าที่อยู่จากข้อมูลลูกค้า
- ก่อนใช้งานจริงควรทดสอบด้วยออเดอร์ตัวอย่าง และตรวจสอบการตั้งค่าการเข้าถึง Web App
