-- Insert sample pricing plans
INSERT INTO plan_pricing (id, name, price, popular, features, description) VALUES
('basic-plan', 'الباقة الأساسية', 200.00, false, ARRAY[
    'حتى 50 مريض',
    'حتى 200 حجز شهريًا',
    'تتبع المدفوعات',
    'تقارير مالية أساسية',
    'دعم عبر البريد الإلكتروني'
], 'مثالية للأطباء المستقلين الجدد')
ON CONFLICT DO NOTHING;

INSERT INTO plan_pricing (id, name, price, popular, features, description) VALUES
('standard-plan', 'الباقة القياسية', 500.00, true, ARRAY[
    'حتى 200 مريض',
    'حجز غير محدود',
    'تتبع المدفوعات المتقدمة',
    'تقارير مالية مفصلة',
    'تذكيرات آلية للمرضى',
    'دعم عبر الهاتف والبريد الإلكتروني',
    'إمكانية تصدير البيانات'
], 'الأكثر شيوعًا للأطباء في مراحل النمو')
ON CONFLICT DO NOTHING;

INSERT INTO plan_pricing (id, name, price, popular, features, description) VALUES
('premium-plan', 'الباقة المميزة', 1000.00, false, ARRAY[
    'عدد لا محدود من المرضى',
    'حجز غير محدود',
    'تتبع المدفوعات المتقدمة',
    'تقارير مالية وتقارير تحليلية',
    'تذكيرات مخصصة للمرضى',
    'دعم فني على مدار الساعة',
    'إمكانية تصدير البيانات بصيغ متعددة',
    'نسخ احتياطي يومي للبيانات',
    'إمكانية تخصيص النظام'
], 'للعيادات الكبيرة والمراكز الطبية')
ON CONFLICT DO NOTHING;