import React, { useState, useContext, createContext, type ReactNode } from 'react';

interface LanguageContextType {
  language: 'zh' | 'en';
  setLanguage: (lang: 'zh' | 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const getLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'zh';
  }
  return 'zh';
};

const translations = {
  zh: {
    'merchant.kyc.title': '🏪 商家註冊與 KYC 驗證',
    'merchant.kyc.subtitle': '成為我們平台的正式餐廳商家，開始發佈即期美食',
    'merchant.kyc.step': '{step}/4',
    'merchant.kyc.basicInfo': '基本信息',
    'merchant.kyc.basicInfoDesc': '請提供您餐廳的基本信息',
    'merchant.kyc.contact': '聯繫方式',
    'merchant.kyc.contactDesc': '請提供餐廳負責人的聯繫方式',
    'merchant.kyc.documents': '身份驗證文件',
    'merchant.kyc.documentsDesc': '上傳營業執照或身份證明文件',
    'merchant.kyc.supplement': '補充信息',
    'merchant.kyc.supplementDesc': '請簡要描述您的餐廳和主營食品',
    'merchant.kyc.restaurantName': '餐廳名稱',
    'merchant.kyc.registrationNumber': '營業執照號',
    'merchant.kyc.address': '經營地址',
    'merchant.kyc.owner': '負責人姓名',
    'merchant.kyc.email': '電子郵件',
    'merchant.kyc.phone': '電話號碼',
    'merchant.kyc.file': '上傳文件 (PNG、JPG、PDF)',
    'merchant.kyc.description': '餐廳描述',
    'merchant.kyc.submit': '提交驗證 →',
    'merchant.kyc.success': '✅ KYC 驗證成功！',
    'merchant.kyc.successMsg': '感謝您完成驗證，現在可以開始發佈商品了...',
    'merchant.kyc.backHome': '← 返回首頁',
    'wallet.install': '請安裝 MetaMask',
  },
  en: {
    'merchant.kyc.title': '🏪 Merchant Registration & KYC Verification',
    'merchant.kyc.subtitle': 'Become an official restaurant merchant on our platform',
    'merchant.kyc.step': '{step}/4',
    'merchant.kyc.basicInfo': 'Basic Information',
    'merchant.kyc.basicInfoDesc': 'Please provide your restaurant\'s basic information',
    'merchant.kyc.contact': 'Contact Information',
    'merchant.kyc.contactDesc': 'Please provide contact information',
    'merchant.kyc.documents': 'Identity Verification Documents',
    'merchant.kyc.documentsDesc': 'Upload business license or identity documents',
    'merchant.kyc.supplement': 'Supplementary Information',
    'merchant.kyc.supplementDesc': 'Please describe your restaurant and main products',
    'merchant.kyc.restaurantName': 'Restaurant Name',
    'merchant.kyc.registrationNumber': 'Business License Number',
    'merchant.kyc.address': 'Business Address',
    'merchant.kyc.owner': 'Manager Name',
    'merchant.kyc.email': 'Email Address',
    'merchant.kyc.phone': 'Phone Number',
    'merchant.kyc.file': 'Upload File (PNG, JPG, PDF)',
    'merchant.kyc.description': 'Restaurant Description',
    'merchant.kyc.submit': 'Submit Verification →',
    'merchant.kyc.success': '✅ KYC Verification Successful!',
    'merchant.kyc.successMsg': 'Thank you for completing verification...',
    'merchant.kyc.backHome': '← Back to Home',
    'wallet.install': 'Please install MetaMask',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<'zh' | 'en'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'zh' | 'en') || 'zh';
  });

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.zh] || key;
  };

  const handleSetLanguage = (lang: 'zh' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
