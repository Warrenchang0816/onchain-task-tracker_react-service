import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../layouts/SidebarLayout';
import { useWallet } from '../components/common/WalletConnect';

interface CustomerProfile {
    walletAddress: string;

    email: string;
    displayName: string;
    registeredAt: string;
}

interface FormErrors {

    email?: string;
    displayName?: string;
    wallet?: string;
}

const STORAGE_KEY = (address: string) => `customer_profile_${address.toLowerCase()}`;

const CustomerRegisterPage = () => {
    const { account, isConnected } = useWallet();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingProfile, setExistingProfile] = useState<CustomerProfile | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Load existing profile if wallet connected
    useEffect(() => {
        if (account) {
            const saved = localStorage.getItem(STORAGE_KEY(account));
            if (saved) {
                try {
                    setExistingProfile(JSON.parse(saved));
                } catch {
                    // ignore
                }
            }
        }
    }, [account]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const validate = (): boolean => {
        const errs: FormErrors = {};
        if (!account) errs.wallet = '請先連接錢包';
        if (!formData.displayName.trim()) errs.displayName = '請輸入姓名';
        if (!formData.email.trim()) errs.email = '請輸入電子郵件';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
            errs.email = '電子郵件格式不正確';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !account) return;

        setIsSubmitting(true);
        await new Promise((r) => setTimeout(r, 800)); // simulate async

        const profile: CustomerProfile = {
            walletAddress: account,
            email: formData.email.trim(),
            displayName: formData.displayName.trim(),
            registeredAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY(account), JSON.stringify(profile));
        setExistingProfile(profile);
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    // ── Already registered view ──────────────────────────────────────────────
    if (existingProfile) {
        return (
            <SidebarLayout>
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#10b981,#065f46)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 24, fontVariationSettings: "'FILL' 1" }}>
                                verified_user
                            </span>
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontFamily: 'Manrope,sans-serif', fontWeight: 800, color: '#065f46' }}>
                                客戶資料
                            </h2>
                            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>已完成註冊</p>
                        </div>
                    </div>

                    {isSuccess && (
                        <div style={{
                            background: '#ecfdf5', border: '1px solid #6ee7b7',
                            borderRadius: 12, padding: '14px 18px', marginBottom: 24,
                            display: 'flex', alignItems: 'center', gap: 10, color: '#065f46',
                        }}>
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            <span style={{ fontWeight: 600 }}>註冊成功！歡迎加入 GreenFood 平台</span>
                        </div>
                    )}

                    <div style={{
                        background: 'white', borderRadius: 16,
                        border: '1.5px solid #d1fae5',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                    }}>
                        <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', padding: '20px 24px', borderBottom: '1px solid #d1fae5' }}>
                            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>顯示名稱</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: '#065f46', fontFamily: 'Manrope,sans-serif' }}>
                                {existingProfile.displayName}
                            </div>
                        </div>

                        {[
                            { icon: 'account_balance_wallet', label: '錢包地址', value: existingProfile.walletAddress, mono: true },
                            { icon: 'mail',                   label: '電子郵件',  value: existingProfile.email,           mono: false },
                            { icon: 'schedule',               label: '註冊時間',  value: new Date(existingProfile.registeredAt).toLocaleString('zh-TW'), mono: false },
                        ].map(({ icon, label, value, mono }) => (
                            <div key={label} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 16,
                                padding: '16px 24px', borderBottom: '1px solid #f3f4f6',
                            }}>
                                <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: 20, marginTop: 2 }}>
                                    {icon}
                                </span>
                                <div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>{label}</div>
                                    <div style={{ fontSize: 14, color: '#1f2937', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>
                                        {value}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                        <button
                            type="button"
                            onClick={() => { setExistingProfile(null); setIsSuccess(false); }}
                            style={{
                                flex: 1, padding: '12px', borderRadius: 10,
                                background: 'white', color: '#065f46',
                                border: '1.5px solid #6ee7b7', fontWeight: 600, fontSize: 14,
                            }}
                        >
                            編輯資料
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/products')}
                            style={{
                                flex: 1, padding: '12px', borderRadius: 10,
                                background: 'linear-gradient(135deg,#10b981,#059669)',
                                color: 'white', border: 'none', fontWeight: 600, fontSize: 14,
                                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                            }}
                        >
                            開始購物
                        </button>
                    </div>
                </div>
            </SidebarLayout>
        );
    }

    // ── Registration form ────────────────────────────────────────────────────
    return (
        <SidebarLayout>
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#10b981,#065f46)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 24 }}>
                            person_add
                        </span>
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontFamily: 'Manrope,sans-serif', fontWeight: 800, color: '#065f46' }}>
                            客戶註冊
                        </h2>
                        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>建立您的 GreenFood 帳號</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Wallet address (read-only) */}
                    <div>
                        <label style={labelStyle}>
                            錢包地址 <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '11px 14px', borderRadius: 10,
                            background: isConnected ? '#f0fdf4' : '#f9fafb',
                            border: `1.5px solid ${errors.wallet ? '#dc2626' : isConnected ? '#6ee7b7' : '#e5e7eb'}`,
                            fontSize: 13, fontFamily: 'monospace',
                            color: isConnected ? '#065f46' : '#9ca3af',
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: isConnected ? '#10b981' : '#9ca3af', fontVariationSettings: "'FILL' 1" }}>
                                {isConnected ? 'verified' : 'account_balance_wallet'}
                            </span>
                            <span style={{ wordBreak: 'break-all' }}>
                                {account ?? '尚未連接錢包 — 請先在右上角連接'}
                            </span>
                        </div>
                        {errors.wallet && <p style={errorStyle}>{errors.wallet}</p>}
                    </div>

                    {/* Display name */}
                    <div>
                        <label style={labelStyle}>
                            姓名 <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            placeholder="請輸入您的真實姓名"
                            style={inputStyle(!!errors.displayName)}
                        />
                        {errors.displayName && <p style={errorStyle}>{errors.displayName}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label style={labelStyle}>
                            電子郵件 <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            style={inputStyle(!!errors.email)}
                        />
                        {errors.email && <p style={errorStyle}>{errors.email}</p>}
                    </div>

                    {/* Privacy note */}
                    <div style={{
                        background: '#f0fdf4', border: '1px solid #d1fae5',
                        borderRadius: 10, padding: '12px 16px',
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                        <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: 18, marginTop: 1 }}>info</span>
                        <p style={{ margin: 0, fontSize: 12, color: '#065f46', lineHeight: 1.6 }}>
                            您的身份資料僅用於平台驗證，不會對外公開。錢包地址將作為您在平台的唯一識別碼。
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !isConnected}
                        style={{
                            padding: '14px', borderRadius: 10, border: 'none',
                            background: (!isConnected || isSubmitting)
                                ? '#d1d5db'
                                : 'linear-gradient(135deg,#10b981,#059669)',
                            color: 'white', fontWeight: 700, fontSize: 15,
                            cursor: (!isConnected || isSubmitting) ? 'not-allowed' : 'pointer',
                            boxShadow: isConnected ? '0 4px 16px rgba(16,185,129,0.35)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'opacity 0.15s',
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                                處理中…
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>how_to_reg</span>
                                立即註冊
                            </>
                        )}
                    </button>
                </form>
            </div>
        </SidebarLayout>
    );
};

// ── Style helpers ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: 6,
    fontSize: 14, fontWeight: 600, color: '#1f2937',
};

const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${hasError ? '#dc2626' : '#d1fae5'}`,
    borderRadius: 10, fontSize: 14, fontFamily: 'inherit',
    background: 'white', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.15s',
});

const errorStyle: React.CSSProperties = {
    margin: '5px 0 0', fontSize: 12, color: '#dc2626',
};

export default CustomerRegisterPage;
