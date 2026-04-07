import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../components/common/WalletConnect';
import SidebarLayout from '../layouts/SidebarLayout';

interface FormData {
  restaurantName: string;
  registrationNumber: string;
  address: string;
  owner: string;
  email: string;
  phone: string;
  description: string;
  file?: File | null;
}

interface FormErrors {
  [key: string]: string;
}

const MerchantKYCPage = () => {
  const navigate = useNavigate();
  const { account, isConnected } = useWallet();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    restaurantName: '',
    registrationNumber: '',
    address: '',
    owner: '',
    email: '',
    phone: '',
    description: '',
    file: null,
  });

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (currentStep === 1) {
      if (!formData.restaurantName.trim()) {
        errors.restaurantName = '請輸入餐廳名稱';
      }
      if (!formData.registrationNumber.trim()) {
        errors.registrationNumber = '請輸入營業執照號';
      }
      if (!formData.address.trim()) {
        errors.address = '請輸入經營地址';
      }
    }

    if (currentStep === 2) {
      if (!formData.owner.trim()) {
        errors.owner = '請輸入負責人姓名';
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = '請輸入有效的電子郵件';
      }
      if (!formData.phone.trim()) {
        errors.phone = '請輸入電話號碼';
      }
    }

    if (currentStep === 4) {
      if (!formData.description.trim()) {
        errors.description = '請輸入餐廳描述';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  // 快速填充演示數據
  const handleDemoFill = () => {
    setFormData({
      restaurantName: '金拱園餐廳',
      registrationNumber: 'BL-2024-001234',
      address: '香港中環皇后大道中 100 號',
      owner: '張三',
      email: 'manager@restaurant.hk',
      phone: '28881234',
      description: '提供優質即期食物販售服務，确保品質和食品安全',
      file: null,
    });
    setFormErrors({});
  };

  const handleNext = () => {
    if (validateForm()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isConnected || !account) {
      alert('請先連接錢包');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 儲存 KYC 數據到 localStorage
      localStorage.setItem(`kyc_${account}`, JSON.stringify({
        restaurantName: formData.restaurantName,
        registrationNumber: formData.registrationNumber,
        address: formData.address,
        owner: formData.owner,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        walletAddress: account,
        approvedAt: new Date().toLocaleString('zh-TW'),
      }));

      // 模擬 API 調用延遲
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/merchant/products');
      }, 2000);
    } catch (error) {
      console.error('提交失敗:', error);
      alert('提交失敗，請稍後重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <SidebarLayout>
        <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '500px',
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ fontSize: '24px', color: '#065f46', marginBottom: '10px' }}>KYC 驗證成功！</h2>
            <p style={{ fontSize: '16px', color: '#047857', marginBottom: '20px' }}>
              感謝您完成驗證，現在可以開始發佈商品了
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>即將返回首頁...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div style={{ minHeight: 'calc(100vh - 200px)', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', color: '#065f46', marginBottom: '10px' }}>🏪 商家註冊與 KYC 驗證</h1>
            <p style={{ fontSize: '16px', color: '#047857' }}>成為我們平台的正式餐廳商家，開始發佈即期美食</p>
          </div>

          {!isConnected && (
            <div style={{
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              color: '#92400e',
              fontSize: '14px',
            }}>
              🔐 請先連接 MetaMask 錢包再進行驗證
            </div>
          )}

          {/* Demo Fill Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <button
              onClick={handleDemoFill}
              style={{
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              📝 填充演示數據
            </button>
          </div>

          {/* Step Container */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px',
          }}>
            {/* Step Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
              paddingBottom: '20px',
              borderBottom: '2px solid #d1fae5',
            }}>
              <h2 style={{ fontSize: '20px', color: '#065f46', fontWeight: '600' }}>
                {currentStep === 1 && '基本信息'}
                {currentStep === 2 && '聯繫方式'}
                {currentStep === 3 && '身份驗證文件'}
                {currentStep === 4 && '補充信息'}
              </h2>
              <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                {currentStep}/4
              </span>
            </div>

            {/* Form Content */}
            <div style={{ marginBottom: '30px' }}>
              {currentStep === 1 && (
                <>
                  <p style={{ color: '#6b7280', marginBottom: '20px' }}>請提供您餐廳的基本信息</p>

                  {/* 錢包地址（唯讀，自動帶入） */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      商家錢包地址 <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1fae5',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      background: '#f0fdf4',
                      color: account ? '#065f46' : '#9ca3af',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: account ? '#10b981' : '#9ca3af' }}>
                        {account ? 'verified' : 'account_balance_wallet'}
                      </span>
                      {account ?? '尚未連接錢包，請先在右上角連接錢包'}
                    </div>
                    {!account && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                        請先連接錢包才能提交 KYC
                      </p>
                    )}
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      餐廳名稱 <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="restaurantName"
                      value={formData.restaurantName}
                      onChange={handleInputChange}
                      placeholder="輸入您的餐廳名稱"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: formErrors.restaurantName ? '2px solid #dc2626' : '1px solid #d1fae5',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {formErrors.restaurantName && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                        {formErrors.restaurantName}
                      </p>
                    )}
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      營業執照號 <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      placeholder="輸入營業執照號"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: formErrors.registrationNumber ? '2px solid #dc2626' : '1px solid #d1fae5',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {formErrors.registrationNumber && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                        {formErrors.registrationNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      經營地址 <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="輸入餐廳地址"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: formErrors.address ? '2px solid #dc2626' : '1px solid #d1fae5',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {formErrors.address && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                        {formErrors.address}
                      </p>
                    )}
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <p style={{ color: '#6b7280', marginBottom: '20px' }}>請提供餐廳負責人的聯繫方式</p>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      負責人姓名 <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="owner"
                      value={formData.owner}
                      onChange={handleInputChange}
                      placeholder="輸入負責人姓名"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: formErrors.owner ? '2px solid #dc2626' : '1px solid #d1fae5',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {formErrors.owner && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                        {formErrors.owner}
                      </p>
                    )}
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      電子郵件 <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="輸入電子郵件"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: formErrors.email ? '2px solid #dc2626' : '1px solid #d1fae5',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {formErrors.email && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      電話號碼 <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="輸入電話號碼"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: formErrors.phone ? '2px solid #dc2626' : '1px solid #d1fae5',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {formErrors.phone && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <p style={{ color: '#6b7280', marginBottom: '20px' }}>上傳營業執照或身份證明文件</p>
                  <div style={{
                    border: '2px dashed #d1fae5',
                    borderRadius: '8px',
                    padding: '30px',
                    textAlign: 'center',
                    backgroundColor: '#f0fdf4',
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📄</div>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="file-input"
                    />
                    <label htmlFor="file-input" style={{
                      display: 'block',
                      cursor: 'pointer',
                      color: '#10b981',
                      fontWeight: '500',
                      marginBottom: '10px',
                    }}>
                      點擊上傳文件
                    </label>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>PNG、JPG、PDF 格式</p>
                    {formData.file && (
                      <p style={{ marginTop: '15px', color: '#10b981', fontSize: '14px' }}>
                        ✓ {formData.file.name}
                      </p>
                    )}
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <p style={{ color: '#6b7280', marginBottom: '20px' }}>請簡要描述您的餐廳和主營食品</p>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      餐廳描述 <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="請描述您的餐廳類型、特色菜品等..."
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: formErrors.description ? '2px solid #dc2626' : '1px solid #d1fae5',
                        borderRadius: '4px',
                        fontSize: '14px',
                        minHeight: '100px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                    {formErrors.description && (
                      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>
                        {formErrors.description}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb',
            }}>
              {currentStep > 1 && (
                <button
                  onClick={handlePrev}
                  style={{
                    padding: '10px 20px',
                    border: '2px solid #10b981',
                    background: 'white',
                    color: '#10b981',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                  }}
                >
                  ← 上一步
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  style={{
                    marginLeft: 'auto',
                    padding: '10px 20px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                  }}
                >
                  下一步 →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isConnected}
                  style={{
                    marginLeft: 'auto',
                    padding: '10px 20px',
                    background: isSubmitting || !isConnected ? '#d1fae5' : '#10b981',
                    color: isSubmitting || !isConnected ? '#6b7280' : 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSubmitting || !isConnected ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                  }}
                >
                  {isSubmitting ? '提交中...' : '提交驗證 →'}
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '20px' }}>
              <div style={{
                height: '4px',
                background: '#e5e7eb',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  background: '#10b981',
                  width: `${(currentStep / 4) * 100}%`,
                  transition: 'width 0.3s ease',
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default MerchantKYCPage;
