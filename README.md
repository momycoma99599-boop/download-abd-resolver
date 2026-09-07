# Download ABD Resolver API

خادم مستقل لتطبيق Download ABD، يدعم `/api/health` و`POST /api/resolve`.

## النشر على Koyeb

1. ارفع هذا المجلد إلى مستودع GitHub جديد باسم `download-abd-resolver`.
2. في Koyeb اختر **Create App** ثم **GitHub**، واختر المستودع والفرع `main`.
3. اختر Builder: **Dockerfile**.
4. اجعل المنفذ `3000` ونوعه HTTP.
5. اضغط Deploy وانتظر حتى تصبح الخدمة Healthy.
6. اختبر: `https://YOUR-SERVICE.koyeb.app/api/health`. يجب أن يظهر JSON فيه `ok: true`.
7. داخل تطبيق Download ABD ضع رابط التحليل الكامل في الإعدادات: `https://YOUR-SERVICE.koyeb.app/api/resolve`.

لا تضع كلمة مرور أو مفاتيح سرية في المستودع. استخدم المحتوى الذي تملك حق تنزيله والتزم بشروط المنصات.
