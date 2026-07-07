import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSense: React.FC = () => {
  useEffect(() => {
    // The AdSense loader script is included once in index.html;
    // here we only request an ad for this slot.
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', width: '728px', height: '90px' }}
      data-ad-client="ca-pub-8678304253364241"
      data-ad-slot="1234567890"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdSense; 