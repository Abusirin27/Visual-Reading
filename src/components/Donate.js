import React, { useState, useEffect } from 'react';
import { CreditCard, Send, Smartphone, X, MessageCircle, MessageSquare } from 'lucide-react';
import emailjs from 'emailjs-com';

const Donate = ({ onClose }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [provider, setProvider] = useState('Libyana');
    const [cardCode, setCardCode] = useState('');
    
    const myNumber = "218924828751"; // بصيغة دولية للواتساب
    const myDisplayNumber = "0924828751";
    const emails = ["freelancing1444@gmail.com", "freelancing1443@gmail.com"];

    useEffect(() => {
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    }, []);

    const handleAction = (type) => {
        if (!cardCode) { alert("يرجى إدخال كود الكرت أولاً"); return; }
        
        const message = `تبرع جديد لموقع القراءة: \nالشبكة: ${provider}\nكود الكرت: ${cardCode}`;

        switch(type) {
            case 'USSD': // شحن فوري
                const ussd = provider === 'Libyana' 
                    ? `tel:*121*${cardCode}*${myDisplayNumber}%23` 
                    : `tel:*111*${cardCode}*${myDisplayNumber}%23`;
                window.location.href = ussd;
                break;
            
            case 'WHATSAPP':
                window.open(`https://wa.me/${myNumber}?text=${encodeURIComponent(message)}`, '_blank');
                break;

            case 'SMS':
                window.location.href = `sms:${myDisplayNumber}?body=${encodeURIComponent(message)}`;
                break;

            case 'EMAIL':
                emails.forEach(email => {
                    emailjs.send('service_default', 'template_donation', {
                        provider: provider,
                        card_code: cardCode,
                        to_email: email
                    }, 'YOUR_PUBLIC_KEY');
                });
                alert("تم الإرسال للإيميل بنجاح!");
                break;
            
            default: break;
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '20px', width: '350px', textAlign: 'right', direction: 'rtl', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#27ae60' }}><CreditCard size={20} /> دعم الموقع</h3>
                    <X onClick={onClose} style={{ cursor: 'pointer', color: '#888' }} />
                </div>

                <select value={provider} onChange={(e) => setProvider(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}>
                    <option value="Libyana">ليبيانا</option>
                    <option value="Al-Madar">المدار الجديد</option>
                </select>

                <input 
                    type="text" 
                    placeholder="أدخل كود الكرت هنا" 
                    value={cardCode} 
                    onChange={(e) => setCardCode(e.target.value)}
                    style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center', fontSize: '18px' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {isMobile && (
                        <>
                            <button onClick={() => handleAction('USSD')} style={btnStyle('#007bff')}><Smartphone size={18}/> شحن فوري</button>
                            <button onClick={() => handleAction('SMS')} style={btnStyle('#6c757d')}><MessageSquare size={18}/> رسالة SMS</button>
                        </>
                    )}
                    <button onClick={() => handleAction('WHATSAPP')} style={btnStyle('#25D366')}><MessageCircle size={18}/> واتساب</button>
                    <button onClick={() => handleAction('EMAIL')} style={btnStyle('#e74c3c')}><Send size={18}/> إيميل</button>
                </div>
            </div>
        </div>
    );
};

const btnStyle = (bg) => ({
    backgroundColor: bg,
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px'
});

export default Donate;
