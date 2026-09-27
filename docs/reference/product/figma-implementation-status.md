# وضعیت واقعی اجرای فیگما

بازنگری۲.۲.۰ — ۲۰۲۶/۰۹/۲۵

فایل موجود: https://www.figma.com/design/UYer2tdXokR61KYthMtPfb

نام صفحه‌های کاربر، فایل قبلی و صفحه کامپوننت‌ها حفظ شدند. طراحی تازه در فایل جدا ساخته نشد. حذف کامل محتوای صفحات موجود انجام نشد؛ اصلاح‌ها موردی و موارد مفقود در همان صفحات نسخه‌ای افزوده شدند.

## تغییرهای ثبت‌شده

- ورود و اطلاعات تکمیلی فروشگاه، دسته/نوع کالا، فهرست کاتالوگ و موجودی، B02 و مسیرهای دوربین، ثبت چندقلمی/Excel، تولید/انقضا/قیمت تولیدکننده.
- فروش چندکالا، ثبت سریع درجا، جست‌وجو و ثبت مشتری، چندروش و نسیه، پیامک/فاکتور، تخصیص وصول و صورت‌حساب.
- گزارش‌های دوره‌ای/روزانه، بدهکاران، کمبود/نقص داده، راکد، تخفیف، خرید در برابر فروش، سلامت موجودی و خروجی.
- پنل مشتری: تسویه با مدرک، پیگیری، پروفایل، نشست‌ها و اعتراض عدم تعلق؛ سفارش: ویترین/سبد/تحویل/تنظیمات؛ ادمین: کاتالوگ/schema/seed؛ باشگاه: دفتر امتیاز و کمپین.

## کنترل و محدودیت

اجزای استفاده‌شده instance همان Button/TextField/AppBar/ProductDataRow/PaymentMethodRow/MetricCard/BottomNavigation هستند. فونت IRANSansX در نمونه‌های کنترل‌شده خوانده شد. تصویر فهرست موجودی موبایل/دسکتاپ، فروش موبایل/دسکتاپ، درخواست تسویه، سبد مشتری و کاتالوگ ادمین بررسی شد. این کنترل نمونه‌ای است و UAT کامل تمام شاخه‌ها یا عملکرد نرم‌افزار نیست. فیلدها و کلیک‌ها نمونه طراحی‌اند؛ پیامک/دانلود/پرداخت واقعی اجرا نمی‌شوند.

سناریوهای قدیمی مرجوعی واقعی، بازپرداخت و بدهی افتتاحیه از نمایش/مسیر MVP کنار گذاشته شدند و nodeهایشان برای بازیابی حفظ شده‌اند. مثال‌های بسته/تکی و حالات بهای معلوم/تخمینی، حالت طراحی‌اند؛ منوی مستقلی برای فروش مدادرنگی ایجاد نشده است.

طراحی ریزحالت‌های همه ۱۱۳ قاعده، از جمله کنترل انتقال مالکیت، نسخه‌های خطای OTP، اصلاحات وابسته و ده تجربه تفصیلی AI هنوز تأیید بصری و UAT کامل ندارند. مشخصات و وظایف آن‌ها در MD آمده‌اند؛ این گزارش ادعای «تمام نقص‌های طراحی بسته شد» ندارد. صفحات مالی موجود حفظ شدند و در این نوبت بازطراحی کامل نشده‌اند.

## فریم‌های ساخته یا اصلاح‌شده

| صفحه | کلید | لینک واقعی فریم | نوع تغییر | مدرک |
|---|---|---|---|---|
| 306-9365 | auth | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-478) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | otp | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-479) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | storeselect | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-480) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | setup | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8744) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | storeprofile | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-481) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | storelegal | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-482) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | home | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8673) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | menu | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-483) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | settings | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-484) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | method | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8778) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | search | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8803) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | cataloglist | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-485) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | categories | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-486) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | category | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-487) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | categorynew | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-488) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | catalog | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8837) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | camera | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9020) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | scan | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8988) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | scanundo | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-489) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | barcode | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-490) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | scanmatch | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9044) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | manual | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8870) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | attrs | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-491) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | images | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-492) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | imageedit | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-493) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | duplicate | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-8957) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | units | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9135) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | stock | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9170) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | stockdetails | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-494) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | pricing | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9409) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | review | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9441) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | success | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9475) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | products | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9504) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | inventory | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-495) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | movements | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-496) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | adjust | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-497) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | count | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-498) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | bulk | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-499) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | bulkreview | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-500) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | bulkdone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-501) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | import | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-502) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | importtemplate | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-503) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | importmap | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-504) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | importpreview | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-505) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | importresolve | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-506) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | importdone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-507) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | importerrors | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-508) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | importhistory | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-509) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | sale | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9604) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | salescan | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-510) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | salebarcode | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-511) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | saleitem | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-512) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | salequick | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-513) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | discount | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-514) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | customersearch | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-515) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | newcustomer | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10060) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | payment | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9647) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | paymentguest | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-516) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | cash | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9685) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | transfer | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-517) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | split | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-518) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | partial | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9711) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | salereview | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-519) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | guestreview | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-520) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | invoice | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9905) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | guestinvoice | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-521) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | receiptcustomer | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-522) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | sms | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-523) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | receiptshare | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-524) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | customers | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10035) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | customercreate | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-525) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | customer | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10094) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | customeredit | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-526) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | customermerge | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-527) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | customerarchive | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-528) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | debtors | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-529) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | settle | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10185) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | allocation | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-530) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | settled | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10225) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | statement | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-531) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | report | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10475) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | salesreport | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-532) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | dailyreport | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-533) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | invoices | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-534) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | low | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10680) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | replenish | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-535) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | cost | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10597) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | validprofit | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10563) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | costpreview | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10629) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | costdone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-10657) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | slow | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-536) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | reportmore | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-537) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | purchasevssales | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-538) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | discountreport | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-539) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | stockhealth | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-540) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | actions | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-541) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | actionlater | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-542) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | actiondone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-543) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | export | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-544) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | exportdone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-545) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | purchaselist | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-546) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | purchase | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-9194) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-9365 | purchasetotals | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-547) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | purchaseattachment | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-548) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | purchasedetail | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-549) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | purchasecorrection | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-550) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | salecorrection | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-551) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | staff | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-552) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | invite | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-553) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | permissions | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-554) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | sessions | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-555) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | sessiondone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-556) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | scansettings | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-557) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | support | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-558) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | supportdone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-559) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-9365 | onboarding | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-560) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | auth | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5341) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | otp | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5342) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | storeselect | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5343) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | setup | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-201) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | storeprofile | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5344) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | storelegal | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5345) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | home | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-107) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | menu | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5346) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | settings | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5347) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | method | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-253) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | search | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-296) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | cataloglist | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5348) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | categories | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5349) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | category | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5350) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | categorynew | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5351) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | catalog | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-348) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | camera | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-621) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | scan | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-571) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | scanundo | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5352) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | barcode | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5353) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | scanmatch | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-663) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | manual | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-399) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | attrs | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5354) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | images | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5355) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | imageedit | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5356) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | duplicate | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-522) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | units | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-808) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | stock | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-861) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | stockdetails | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5357) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | pricing | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-1244) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | review | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-1294) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | success | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-1346) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | products | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-1393) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | inventory | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5358) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | movements | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5359) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | adjust | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5360) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | count | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5361) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | bulk | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5362) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | bulkreview | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5363) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | bulkdone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5364) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | import | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5365) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | importtemplate | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5366) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | importmap | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5367) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | importpreview | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5368) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | importresolve | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5369) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | importdone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5370) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | importerrors | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5371) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | importhistory | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5372) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | sale | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-1547) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | salescan | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5373) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | salebarcode | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5374) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | saleitem | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5375) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | salequick | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5376) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | discount | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5377) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | customersearch | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5378) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | newcustomer | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-2291) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | payment | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-1608) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | paymentguest | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5379) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | cash | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-1664) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | transfer | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5380) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | split | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5381) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | partial | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-1708) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | salereview | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5382) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | guestreview | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5383) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | invoice | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-2028) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | guestinvoice | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5384) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | receiptcustomer | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5385) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | sms | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5386) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | receiptshare | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5387) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | customers | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-2248) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | customercreate | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5388) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | customer | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-2343) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | customeredit | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5389) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | customermerge | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5390) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | customerarchive | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5391) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | debtors | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5392) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | settle | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-2488) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | allocation | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5393) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | settled | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-2546) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | statement | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5394) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | report | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-2958) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | salesreport | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5395) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | dailyreport | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5396) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | invoices | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5397) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | low | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-3253) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | replenish | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5398) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | cost | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-3116) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | validprofit | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-3064) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | costpreview | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-3166) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | costdone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-3212) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | slow | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5399) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | reportmore | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5400) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | purchasevssales | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5401) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | discountreport | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5402) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | stockhealth | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5403) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | actions | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5404) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | actionlater | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5405) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | actiondone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5406) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | export | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5407) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | exportdone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5408) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | purchaselist | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5409) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | purchase | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=312-903) | اصلاح موردی؛ ساختار قبلی محفوظ | اجرای ثبت شده |
| 306-3278 | purchasetotals | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5410) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | purchaseattachment | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5411) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | purchasedetail | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5412) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | purchasecorrection | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5413) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | salecorrection | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5414) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | staff | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5415) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | invite | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5416) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | permissions | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5417) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | sessions | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5418) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | sessiondone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5419) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | scansettings | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5420) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | support | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5421) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | supportdone | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5422) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 306-3278 | onboarding | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=358-5423) | ساخته‌شده با کامپوننت موجود | اجرای ثبت شده |
| 311:847 | ledger | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11617) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 311:847 | rewards | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11618) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 311:847 | campaign | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11619) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:378 | settlementrequest | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-35) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:378 | requesttimeline | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-36) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:378 | profile | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-37) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:378 | buyersessions | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-38) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:378 | claim | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-39) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:378 | buyernavigation | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-40) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 311:2 | storefront | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11599) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 311:2 | buyercart | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11600) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 311:2 | checkout | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11601) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 311:2 | orderrequested | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11602) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 311:2 | deliverysettings | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11603) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 311:2 | pickup | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11604) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 307:425 | admincatalog | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11611) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 307:425 | adminschema | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11612) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 307:425 | schemaimpact | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11613) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 307:425 | seedhistory | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11614) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 307:425 | seedpreview | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11615) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 307:425 | seedresult | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11616) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:2 | settlementrequest | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11593) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:2 | requesttimeline | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11594) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:2 | profile | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11595) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:2 | buyersessions | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11596) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:2 | claim | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11597) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:2 | buyernavigation | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11598) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:596 | storefront | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11605) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:596 | buyercart | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11606) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:596 | checkout | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11607) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:596 | orderrequested | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11608) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:596 | deliverysettings | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11609) | صفحه مفقود افزوده شد | اجرای ثبت شده |
| 310:596 | pickup | [بازکردن](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=367-11610) | صفحه مفقود افزوده شد | اجرای ثبت شده |


## بازنگری 2.3.0 — تکمیل Seller-V2

فقط صفحه `306:9365` ویرایش شد. صفحات منبع و کامپوننت‌های اصلی و نسخه دسکتاپ و پنل مشتری در این نوبت ویرایش نشدند. ۴۳ صفحه/حالت جدید و اصلاح موضعی صفحات موجود ثبت شد. فهرست زیر شامل حالت‌های تأیید و نتیجه نیز هست؛ ۴۳ قابلیت مستقل نیست.

| صفحه/حالت | لینک مستقیم |
|---|---|
| ST02 / انتخاب نوع فروشگاه | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-6827) |
| STORE-04 · SHOP-S02 / اطلاعات فروشگاه | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-6853) |
| STORE-05 · SHOP-S03 / ویرایش فروشگاه | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-6912) |
| ORD-S01 / سفارش‌ها | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-6944) |
| ORD-S02 / جزئیات سفارش | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7005) |
| PAY-S01 / بررسی فیش | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7058) |
| CAT-S03 / جزئیات کاتالوگ | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7104) |
| DEBT-01 / نمای کلی نسیه | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7158) |
| DEBT-03 / گردش نسیه مشتری | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7212) |
| CRD-S01 / وضعیت بدهی و چک مشتری | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7260) |
| checks / چک‌های دریافتی | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7323) |
| checkform / دریافت چک برای فروش | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7382) |
| checksettle / دریافت چک بابت بدهی | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7458) |
| checkreview / بازبینی فروش با چک | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7527) |
| checkdone / فروش و چک ثبت شد | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7596) |
| invoicecheque / فاکتور فروش با چک | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7657) |
| checksettleReview / بازبینی دریافت چک | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7725) |
| checkdetail / جزئیات چک دریافتی | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7794) |
| checkcollect / تأیید وصول چک | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7866) |
| checkcollected / چک وصول شد | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7916) |
| checkbounce / ثبت برگشت چک | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-7974) |
| checkbounced / چک برگشتی ثبت شد | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8028) |
| checkreturn / عودت چک به مشتری | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8096) |
| checkreturned / عودت چک ثبت شد | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8146) |
| checkimage / تصویر چک | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8205) |
| checkimageReady / تصویر چک انتخاب شد | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8248) |
| debtmessage / یادآوری بدهی | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8290) |
| debtmessageDone / نتیجه ارسال یادآوری | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8336) |
| purchaseunit / انتخاب واحد خرید | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8376) |
| purchaseeach / خرید عددی | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8419) |
| unitpicker / واحد پایه دسته‌بندی | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8477) |
| categoryweight / ثبت دسته‌بندی | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8526) |
| catalogweight / ثبت کاتالوگ وزنی | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8575) |
| stockweight / ثبت موجودی وزنی | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8628) |
| weightreview / بازبینی موجودی وزنی | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8678) |
| orderapproved / سفارش تأیید شد | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8727) |
| orderreject / رد سفارش | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8777) |
| slipapproved / پرداخت تأیید شد | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8820) |
| slipreject / عدم تطابق فیش | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=385-8859) |
| openingpack / موجودی اولیه بسته‌ای | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=390-5870) |
| checksplit / چک در پرداخت چندروش | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=390-5907) |
| checksplitreview / بازبینی پرداخت ترکیبی با چک | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=390-5983) |
| checksplitdone / فروش با پرداخت ترکیبی ثبت شد | [مشاهده](https://www.figma.com/design/UYer2tdXokR61KYthMtPfb?node-id=390-6052) |

### اصلاح صفحات موجود

setup: نام و صنف اجباری، حذف درخواست دوباره موبایل، شیوه فعالیت خرده/عمده/هر دو، تکمیل اختیاری. storeprofile: عکس/ایمیل/موقعیت افزوده، تماس/نشانی/کدپستی/ساعات حفظ. storelegal: کد ملی/حساب/کارت افزوده، مجوز/شبا/نام مالک حفظ. categorynew: واحد پایه؛ manual: واحد از نوع؛ units/purchase/opening: انتخاب واحد ورود و حفظ پایه کاتالوگ. payment/split/settle: ورودی چک و پرداخت ترکیبی. debtors/customer/credit: ورودی نمای کلی، گردش و وضعیت بدهی/چک. scan: کادر واقعی مرجع BAR01 و حذف دکمه تکراری؛ camera: درخواست مجوز؛ conflict: مقایسه داده و مسیرهای رفع مغایرت. cataloglist و settings و menu به جزئیات تازه متصل‌اند.

### شواهد بررسی

تصاویر ایجاد فروشگاه، مشاهده و ویرایش فروشگاه، نمای کلی و گردش نسیه، فهرست چک، فرم چک، اسکنر و بازبینی پرداخت ترکیبی بررسی شدند. اسکرول اطلاعات فروشگاه و ویرایش اصلاح شد. فونت همه متن‌های۴۳صفحه/حالت جدید IRANSansX است؛ چهار متن Inter در گردش مرجع اصلاح شد. صفحه ویرایش‌شده قبلی کاربر331:5255 حفظ شد. پرداخت ترکیبی نمونه:۸۰٬۰۰۰دریافت قطعی +۲۴٬۰۰۰چک =۱۰۴٬۰۰۰فروش.

### حدود تحویل

این تحویل طراحی و پروتوتایپ نمونه است، نه نرم‌افزار اجراشده. فرم‌ها، انتخاب فایل/دوربین/نقشه، فیلترها، اعداد و وضعیت‌ها داده زنده ندارند؛ بعضی گزینه‌ها فقط حالت نمایشی دارند و همه ترکیب‌های ورودی در پروتوتایپ شبیه‌سازی نشده‌اند. شاخه‌های خطای اجرایی، اعتبارسنجی و همزمانی طبق MD باید در پیاده‌سازی و UAT آزموده شوند. صفحات سفارش و فیش از مسیر مستقل طراحی قابل بررسی‌اند؛ سفارش آنلاین در منوی MVP فعال نشده و دامنه انتشار۳.۰ حفظ است. این گزارش ادعای بازطراحی یا تأیید همه صفحات فایل فیگما ندارد.
