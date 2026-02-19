import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types ---

type PricingMode = 'standard' | 'discount' | 'hidden';

type Product = {
  id: string;
  name: string;
  price: string;
  discountText: string; // e.g. "Up to 50% Off"
  pricingMode: PricingMode;
  description: string;
  imageUrl: string;
  link: string;
  brandName: string;
  brandLogoUrl: string;
  renderMode: 'html' | 'image-only'; // 'html' = separate text/img, 'image-only' = user provides composite image
};

type EmailConfig = {
  template: 'classic' | 'modern' | 'banner';
  layout: {
    contentWidth: number; // Default 600
    productImageSize: 'large' | 'medium' | 'small'; // Affects image scale
  };
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string; // Used for discounts/highlights
  };
  company: {
    name: string;
    logoUrl: string;
    websiteUrl: string;
  };
  hero: {
    show: boolean;
    imageUrl: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
  products: Product[];
  footer: {
    text: string;
    address: string;
  };
};

// --- Default Data ---

const INITIAL_CONFIG: EmailConfig = {
  template: 'classic',
  layout: {
    contentWidth: 600,
    productImageSize: 'large',
  },
  theme: {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#ef4444',
  },
  company: {
    name: 'TechNova',
    logoUrl: 'https://via.placeholder.com/150x50/3b82f6/ffffff?text=TechNova',
    websiteUrl: 'https://example.com',
  },
  hero: {
    show: true,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600&q=80',
    title: 'Summer Collection 2024',
    subtitle: 'Discover the latest trends in technology and design.',
    ctaText: 'Shop Now',
    ctaLink: 'https://example.com/shop',
  },
  products: [
    {
      id: '1',
      name: 'Wireless Headphones',
      price: '$199.00',
      discountText: 'Save $50',
      pricingMode: 'standard',
      description: 'Noise cancelling, 40h battery life. Great for travel.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      link: 'https://example.com/p1',
      brandName: 'Sony',
      brandLogoUrl: '',
      renderMode: 'html',
    },
    {
      id: '2',
      name: 'Smart Watch Series 7',
      price: '$299.00',
      discountText: 'Up to 20% Off',
      pricingMode: 'discount', 
      description: 'Fitness tracking, heart rate monitor, ECG, Always-On Retina display, water resistant.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      link: 'https://example.com/p2',
      brandName: 'Apple',
      brandLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
      renderMode: 'html',
    },
    {
      id: '3',
      name: 'Exclusive Camera',
      price: '$1200.00',
      discountText: '',
      pricingMode: 'hidden',
      description: 'Professional grade photography gear. Inquire for pricing.',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      link: 'https://example.com/p3',
      brandName: 'Leica',
      brandLogoUrl: '',
      renderMode: 'html',
    },
  ],
  footer: {
    text: '© 2024 TechNova Inc. All rights reserved.',
    address: '123 Innovation Dr, Tech City, CA 94000',
  },
};

// --- Email Generator Functions ---

const generateEmailHTML = (config: EmailConfig) => {
  const { theme, company, hero, products, footer, layout } = config;

  const buttonStyle = `display: inline-block; padding: 12px 24px; background-color: ${theme.primaryColor}; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;`;
  const buttonSmallStyle = `display: inline-block; padding: 8px 16px; background-color: ${theme.primaryColor}; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;`;
  
  // Scale factor based on size setting
  const getScaleFactor = () => {
    if (layout.productImageSize === 'small') return 0.6;
    if (layout.productImageSize === 'medium') return 0.8;
    return 1.0;
  };

  // Helper: Calculate exact pixel width for Grid images
  // Total Width / 2 columns - Padding (approx 20px per cell)
  const getGridImagePixelWidth = () => {
    const colWidth = (layout.contentWidth / 2) - 20; 
    return Math.round(colWidth * getScaleFactor());
  };

  // Helper: Calculate exact pixel width for Banner images
  // Total Width - Padding
  const getBannerImagePixelWidth = () => {
    let scale = getScaleFactor();
    if (layout.productImageSize === 'medium') scale = 0.85; // slightly different scale for banner
    if (layout.productImageSize === 'small') scale = 0.7;
    // Assuming full width but maybe some internal padding
    return Math.round(layout.contentWidth * scale); 
  };

  const getListImagePixelWidth = () => {
    if (layout.productImageSize === 'small') return 100;
    if (layout.productImageSize === 'medium') return 140;
    return 180;
  };

  // Helper: Render Brand Info
  const renderBrand = (p: Product, align: 'left' | 'center' = 'center') => {
    if (!p.brandName && !p.brandLogoUrl) return '';
    const justify = align === 'left' ? 'flex-start' : 'center';
    return `
      <div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: ${justify}; gap: 6px;">
        ${p.brandLogoUrl ? `<img src="${p.brandLogoUrl}" alt="${p.brandName}" width="20" height="20" style="display:inline-block; vertical-align:middle;" />` : ''}
        ${p.brandName ? `<span style="font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px; font-weight: 600; vertical-align:middle;">${p.brandName}</span>` : ''}
      </div>
    `;
  };

  // Helper: Render Price
  const renderPrice = (p: Product, fontSize: string = '18px') => {
    if (p.pricingMode === 'hidden') return '';
    if (p.pricingMode === 'discount') {
      return `<p style="margin: 0 0 10px 0; color: ${theme.accentColor}; font-weight: bold; font-size: ${fontSize};">${p.discountText}</p>`;
    }
    return `<p style="margin: 0 0 10px 0; color: ${theme.primaryColor}; font-weight: bold; font-size: ${fontSize};">${p.price}</p>`;
  };

  // 1. Classic Grid (2 Columns)
  const renderProductsGrid = () => {
    let html = '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>';
    const imgPixelWidth = getGridImagePixelWidth();
    
    products.forEach((product, index) => {
      // New Row logic
      if (index > 0 && index % 2 === 0) {
        html += '</tr><tr>';
      }
      
      let content = '';
      if (product.renderMode === 'image-only') {
        content = `
          <a href="${product.link}" style="text-decoration:none; display:block; text-align: center;">
            <img src="${product.imageUrl}" alt="${product.name}" width="${imgPixelWidth}" style="display: inline-block; width: ${imgPixelWidth}px; max-width: 100%; height: auto; border-radius: 8px;" />
          </a>
        `;
      } else {
        content = `
          <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
            <!-- 1. Image Row -->
            <tr>
              <td align="center" style="padding-top: ${layout.productImageSize === 'large' ? '0' : '15px'}; font-size: 0;" valign="top">
                <a href="${product.link}" style="text-decoration:none; display:block;">
                  <img src="${product.imageUrl}" alt="${product.name}" width="${imgPixelWidth}" style="display: inline-block; width: ${imgPixelWidth}px; max-width: 100%; height: auto; object-fit: cover; aspect-ratio: 1/1;" />
                </a>
              </td>
            </tr>
            <!-- 2. Content Row -->
            <tr>
              <td style="padding: 15px 15px 5px 15px; text-align: center;" valign="top">
                ${renderBrand(product, 'center')}
                <h3 style="margin: 0 0 8px 0; color: ${theme.textColor}; font-size: 16px; line-height: 1.3;">${product.name}</h3>
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${product.description}</p>
                ${renderPrice(product)}
              </td>
            </tr>
            <!-- 3. Button Row -->
            <tr>
              <td style="padding: 0 15px 20px 15px; text-align: center;" valign="bottom">
                <a href="${product.link}" style="display: inline-block; padding: 10px 20px; background-color: ${theme.primaryColor}; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: bold;">View Details</a>
              </td>
            </tr>
          </table>
        `;
      }

      html += `
        <td width="50%" valign="top" style="padding: 10px;">
          ${content}
        </td>
      `;
    });
    // Fill empty cell if odd number of products
    if (products.length % 2 !== 0) {
        html += '<td width="50%"></td>';
    }
    html += '</tr></table>';
    return html;
  };

  // 2. Modern List
  const renderProductsList = () => {
    let html = '<table width="100%" cellpadding="0" cellspacing="0" border="0">';
    const imgSize = getListImagePixelWidth();

    products.forEach((product) => {
      let content = '';
      if (product.renderMode === 'image-only') {
        content = `
           <a href="${product.link}" style="text-decoration:none; display:block;">
             <img src="${product.imageUrl}" alt="${product.name}" width="${layout.contentWidth - 40}" style="display: block; border-radius: 8px; width: 100%; height: auto;" />
           </a>
        `;
      } else {
        content = `
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="${imgSize + 10}" valign="top">
                  <a href="${product.link}" style="text-decoration:none; display:block;">
                    <img src="${product.imageUrl}" alt="${product.name}" width="${imgSize}" style="display: block; border-radius: 6px; object-fit: cover; height: ${imgSize}px; width: ${imgSize}px;" />
                  </a>
                </td>
                <td valign="top" style="padding-left: 20px;">
                  ${renderBrand(product, 'left')}
                  <h3 style="margin: 0 0 5px 0; color: ${theme.textColor}; font-size: 18px;">${product.name}</h3>
                  ${renderPrice(product)}
                  <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px; line-height: 1.4;">${product.description}</p>
                  <a href="${product.link}" style="color: ${theme.primaryColor}; text-decoration: underline; font-size: 14px;">Buy Now &rarr;</a>
                </td>
              </tr>
            </table>
        `;
      }

      html += `
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
            ${content}
          </td>
        </tr>
      `;
    });
    html += '</table>';
    return html;
  };

  // 3. Banner Style
  const renderProductsBanner = () => {
    let html = '<table width="100%" cellpadding="0" cellspacing="0" border="0">';
    const imgPixelWidth = getBannerImagePixelWidth();

    products.forEach((product) => {
       let content = '';
       if (product.renderMode === 'image-only') {
          content = `
            <a href="${product.link}" style="text-decoration:none; display:block; text-align: center;">
              <img src="${product.imageUrl}" alt="${product.name}" width="${imgPixelWidth}" style="display: inline-block; width: ${imgPixelWidth}px; max-width: 100%; height: auto;" />
            </a>
          `;
       } else {
          content = `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e5e7eb; border-radius: 0px; margin-bottom: 20px;">
              <!-- Image Row -->
              <tr>
                <td align="center" style="padding-top: ${layout.productImageSize === 'large' ? '0' : '20px'};">
                  <a href="${product.link}" style="text-decoration:none; display:block;">
                    <img src="${product.imageUrl}" alt="${product.name}" width="${imgPixelWidth}" style="display: inline-block; width: ${imgPixelWidth}px; max-width: 100%; height: auto;" />
                  </a>
                </td>
              </tr>
              <!-- Content Row -->
              <tr>
                <td style="padding: 24px; text-align: left; background-color: #ffffff;">
                   ${(product.brandName || product.brandLogoUrl) ? `
                   <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 8px;">
                     <tr>
                       <td>${renderBrand(product, 'left')}</td>
                     </tr>
                   </table>
                   ` : ''}
                   <h3 style="margin: 0 0 10px 0; color: ${theme.textColor}; font-size: 22px; line-height: 1.3;">${product.name}</h3>
                   <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">${product.description}</p>
                   <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #f3f4f6; padding-top: 15px;">
                      <tr>
                        <td valign="middle" align="left">
                           ${renderPrice(product, '20px')}
                        </td>
                        <td valign="middle" align="right">
                           <a href="${product.link}" style="${buttonSmallStyle}">Shop Now</a>
                        </td>
                      </tr>
                   </table>
                </td>
              </tr>
            </table>
          `;
       }

       html += `
         <tr>
           <td style="padding-bottom: 20px;">
             ${content}
           </td>
         </tr>
       `;
    });
    html += '</table>';
    return html;
  };

  // --- HTML Assembly ---
  
  const headerHTML = `
    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-bottom: 2px solid ${theme.primaryColor};">
      <tr>
        <td align="center" style="padding: 20px;">
          <a href="${company.websiteUrl}" style="text-decoration:none;">
            ${company.logoUrl 
              ? `<img src="${company.logoUrl}" alt="${company.name}" height="50" style="display: block; height: 50px;" />` 
              : `<h1 style="margin:0; color: ${theme.primaryColor};">${company.name}</h1>`
            }
          </a>
        </td>
      </tr>
    </table>
  `;

  const heroHTML = hero.show ? `
    <!-- Hero Section -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding: 0; text-align: center;">
          <a href="${hero.ctaLink}" style="display:block; text-decoration:none;">
            <img src="${hero.imageUrl}" alt="${hero.title}" width="${layout.contentWidth}" style="display: block; width: 100%; max-width: ${layout.contentWidth}px; height: auto;" />
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px 20px; background-color: ${config.template === 'modern' ? '#f8fafc' : '#ffffff'}; text-align: center; border-bottom: 1px solid #f3f4f6;">
          <h2 style="margin: 0 0 10px 0; color: ${theme.textColor}; font-size: 24px;">${hero.title}</h2>
          <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.5;">${hero.subtitle}</p>
          <a href="${hero.ctaLink}" style="${buttonStyle}">${hero.ctaText}</a>
        </td>
      </tr>
    </table>
  ` : '';

  let productsHTML = '';
  if (config.template === 'classic') productsHTML = renderProductsGrid();
  else if (config.template === 'modern') productsHTML = renderProductsList();
  else if (config.template === 'banner') productsHTML = renderProductsBanner();

  const footerHTML = `
    <!-- Footer -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; margin-top: 20px;">
      <tr>
        <td align="center" style="padding: 30px 20px; color: #6b7280; font-size: 12px; line-height: 1.5;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">${company.name}</p>
          <p style="margin: 0 0 10px 0;">${footer.address}</p>
          <p style="margin: 0;">${footer.text}</p>
          <div style="margin-top: 15px;">
            <a href="${company.websiteUrl}" style="color: ${theme.primaryColor}; text-decoration: none;">Visit Website</a>
          </div>
        </td>
      </tr>
    </table>
  `;

  // Wrapper for centering in Outlook
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${hero.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
  <center>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table border="0" cellpadding="0" cellspacing="0" width="${layout.contentWidth}" style="max-width: ${layout.contentWidth}px; background-color: ${theme.backgroundColor}; width: ${layout.contentWidth}px;">
            <tr>
              <td>
                ${headerHTML}
                ${heroHTML}
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 20px;">
                      ${productsHTML}
                    </td>
                  </tr>
                </table>
                ${footerHTML}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
  `;
};

// --- Icons ---
const IconGrid = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconList = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IconBanner = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
const IconCopy = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconCode = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconImage = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

// --- Components ---

const App = () => {
  const [config, setConfig] = useState<EmailConfig>(INITIAL_CONFIG);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'products'>('content');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');

  useEffect(() => {
    const html = generateEmailHTML(config);
    setHtmlOutput(html);
  }, [config]);

  // Helper to calculate hint for image dimensions
  const getImageHint = () => {
    const width = config.layout.contentWidth;
    // const padding = 40; // Approx padding
    if (config.template === 'classic') {
       // 2 columns
       const colWidth = (width / 2) - 20;
       let scale = 1;
       if (config.layout.productImageSize === 'medium') scale = 0.8;
       if (config.layout.productImageSize === 'small') scale = 0.6;
       const px = Math.round(colWidth * scale);
       return `${px} x ${px} px`;
    }
    if (config.template === 'modern') {
       let px = 180;
       if (config.layout.productImageSize === 'medium') px = 140;
       if (config.layout.productImageSize === 'small') px = 100;
       return `${px} x ${px} px`;
    }
    if (config.template === 'banner') {
       // const colWidth = width;
       let scale = 1;
       if (config.layout.productImageSize === 'medium') scale = 0.85;
       if (config.layout.productImageSize === 'small') scale = 0.7;
       const px = Math.round(width * scale);
       return `${px} px width`;
    }
    return '';
  };

  const copyVisual = async () => {
    try {
      const blob = new Blob([htmlOutput], { type: 'text/html' });
      const textBlob = new Blob(['Please paste this in an email client that supports HTML.'], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob }),
      ]);
      setCopyFeedback('Visual copied! Paste into Gmail/Outlook.');
    } catch (err) {
      console.error(err);
      setCopyFeedback('Failed to copy. Try using Chrome.');
    }
    setTimeout(() => setCopyFeedback(''), 3000);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput);
      setCopyFeedback('HTML Source Code Copied!');
    } catch (err) {
      setCopyFeedback('Failed to copy code.');
    }
    setTimeout(() => setCopyFeedback(''), 3000);
  };

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    const newProducts = [...config.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setConfig({ ...config, products: newProducts });
  };

  const removeProduct = (index: number) => {
    const newProducts = config.products.filter((_, i) => i !== index);
    setConfig({ ...config, products: newProducts });
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: 'New Product',
      price: '$99.00',
      discountText: '',
      pricingMode: 'standard',
      description: 'Product description goes here.',
      imageUrl: 'https://via.placeholder.com/600x600',
      link: '#',
      brandName: '',
      brandLogoUrl: '',
      renderMode: 'html',
    };
    setConfig({ ...config, products: [...config.products, newProduct] });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* --- Sidebar Editor --- */}
      <div className="w-1/3 min-w-[380px] bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-blue-600">✉️</span> Email Builder
          </h1>
          <p className="text-xs text-gray-500 mt-1">Design, Copy, Send.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Info
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'design' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Design
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          
          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Company</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    value={config.company.name}
                    onChange={(e) => setConfig({...config, company: {...config.company, name: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Logo URL</label>
                  <input 
                    type="text" 
                    value={config.company.logoUrl}
                    onChange={(e) => setConfig({...config, company: {...config.company, logoUrl: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Website URL</label>
                  <input 
                    type="text" 
                    value={config.company.websiteUrl}
                    onChange={(e) => setConfig({...config, company: {...config.company, websiteUrl: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Hero Banner</h3>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={config.hero.show} 
                      onChange={(e) => setConfig({...config, hero: {...config.hero, show: e.target.checked}})}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"></div>
                  </label>
                </div>
                
                {config.hero.show && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Image URL (Rec: {config.layout.contentWidth}x300)</label>
                      <input 
                        type="text" 
                        value={config.hero.imageUrl}
                        onChange={(e) => setConfig({...config, hero: {...config.hero, imageUrl: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Headline</label>
                      <input 
                        type="text" 
                        value={config.hero.title}
                        onChange={(e) => setConfig({...config, hero: {...config.hero, title: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
                      <textarea 
                        value={config.hero.subtitle}
                        onChange={(e) => setConfig({...config, hero: {...config.hero, subtitle: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
                        <input 
                          type="text" 
                          value={config.hero.ctaText}
                          onChange={(e) => setConfig({...config, hero: {...config.hero, ctaText: e.target.value}})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Button Link</label>
                        <input 
                          type="text" 
                          value={config.hero.ctaLink}
                          onChange={(e) => setConfig({...config, hero: {...config.hero, ctaLink: e.target.value}})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

               <div className="pt-6 border-t border-gray-200 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Footer</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Footer Text</label>
                  <textarea 
                    value={config.footer.text}
                    onChange={(e) => setConfig({...config, footer: {...config.footer, text: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <input 
                    type="text" 
                    value={config.footer.address}
                    onChange={(e) => setConfig({...config, footer: {...config.footer, address: e.target.value}})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
             <div className="space-y-6">
               <div className="flex justify-between items-center">
                 <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Product List</h3>
                 <button 
                  onClick={addProduct}
                  className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
                 >
                   <IconPlus /> Add Product
                 </button>
               </div>
               
               <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800 flex items-start gap-2">
                 <span className="text-lg">💡</span>
                 <div>
                   <strong>Recommended Image Cut:</strong> {getImageHint()}
                   <div className="mt-1 opacity-75">Based on current layout settings.</div>
                 </div>
               </div>

               <div className="space-y-4">
                 {config.products.map((product, index) => (
                   <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm relative group">
                     <button 
                      onClick={() => removeProduct(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 z-10"
                      title="Remove Product"
                     >
                       <IconTrash />
                     </button>
                     
                     <div className="grid grid-cols-1 gap-3">
                       
                       {/* Render Mode Toggle */}
                       <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                         <span className="text-xs font-medium text-gray-600">Layout Type:</span>
                         <div className="flex bg-white rounded border border-gray-300 p-0.5">
                           <button 
                             onClick={() => updateProduct(index, 'renderMode', 'html')}
                             className={`px-2 py-0.5 text-[10px] rounded ${product.renderMode === 'html' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500'}`}
                           >
                             Standard
                           </button>
                           <button 
                             onClick={() => updateProduct(index, 'renderMode', 'image-only')}
                             className={`px-2 py-0.5 text-[10px] rounded ${product.renderMode === 'image-only' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500'}`}
                           >
                             Image Only
                           </button>
                         </div>
                       </div>

                       {/* Image Input */}
                       <div className="flex gap-3 items-start">
                          <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex-shrink-0 overflow-hidden">
                             {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <IconImage />}
                          </div>
                          <div className="flex-1">
                             <label className="block text-xs text-gray-500 mb-1">
                               {product.renderMode === 'image-only' ? 'Full Image URL (Includes Text)' : 'Product Image URL'}
                             </label>
                             <input 
                              type="text" 
                              value={product.imageUrl} 
                              onChange={(e) => updateProduct(index, 'imageUrl', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                            />
                            <div className="mt-2">
                               <label className="block text-xs text-gray-500 mb-1">Click Link URL</label>
                               <input 
                                type="text" 
                                value={product.link} 
                                onChange={(e) => updateProduct(index, 'link', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-blue-600"
                              />
                            </div>
                          </div>
                       </div>
                       
                       {/* Standard Mode Fields */}
                       {product.renderMode === 'html' && (
                         <>
                           <div className="pt-2 border-t border-gray-100">
                             <div className="grid grid-cols-2 gap-2 mb-2">
                               <div>
                                 <label className="block text-xs text-gray-500 mb-1">Brand Name (Opt)</label>
                                 <input 
                                   type="text" 
                                   value={product.brandName || ''} 
                                   onChange={(e) => updateProduct(index, 'brandName', e.target.value)}
                                   className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                 />
                               </div>
                               <div>
                                 <label className="block text-xs text-gray-500 mb-1">Brand Logo URL (Opt)</label>
                                 <input 
                                   type="text" 
                                   value={product.brandLogoUrl || ''} 
                                   onChange={(e) => updateProduct(index, 'brandLogoUrl', e.target.value)}
                                   className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                 />
                               </div>
                             </div>

                             <label className="block text-xs text-gray-500 mb-1">Product Title</label>
                             <input 
                               type="text" 
                               value={product.name} 
                               onChange={(e) => updateProduct(index, 'name', e.target.value)}
                               className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium mb-2"
                             />

                             <div className="bg-gray-50 p-2 rounded mb-2">
                                <label className="text-xs text-gray-500 block mb-1">Pricing Display</label>
                                <div className="flex gap-1 mb-2">
                                  <button 
                                    onClick={() => updateProduct(index, 'pricingMode', 'standard')}
                                    className={`flex-1 text-[10px] py-1 border rounded ${product.pricingMode === 'standard' ? 'bg-blue-100 border-blue-200 text-blue-700 font-bold' : 'bg-white border-gray-200 text-gray-600'}`}
                                  >
                                    Price
                                  </button>
                                  <button 
                                    onClick={() => updateProduct(index, 'pricingMode', 'discount')}
                                    className={`flex-1 text-[10px] py-1 border rounded ${product.pricingMode === 'discount' ? 'bg-red-50 border-red-200 text-red-600 font-bold' : 'bg-white border-gray-200 text-gray-600'}`}
                                  >
                                    Discount
                                  </button>
                                  <button 
                                    onClick={() => updateProduct(index, 'pricingMode', 'hidden')}
                                    className={`flex-1 text-[10px] py-1 border rounded ${product.pricingMode === 'hidden' ? 'bg-gray-200 border-gray-300 text-gray-800 font-bold' : 'bg-white border-gray-200 text-gray-600'}`}
                                  >
                                    Hidden
                                  </button>
                                </div>

                                {product.pricingMode === 'standard' && (
                                  <input 
                                    type="text" 
                                    value={product.price} 
                                    onChange={(e) => updateProduct(index, 'price', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="$0.00"
                                  />
                                )}
                                
                                {product.pricingMode === 'discount' && (
                                  <input 
                                    type="text" 
                                    value={product.discountText || ''} 
                                    onChange={(e) => updateProduct(index, 'discountText', e.target.value)}
                                    className="w-full px-2 py-1 border border-red-300 rounded text-sm text-red-600"
                                    placeholder="Up to 50% Off"
                                  />
                                )}

                                {product.pricingMode === 'hidden' && (
                                   <div className="text-[10px] text-gray-400 italic text-center py-1">Price will be hidden</div>
                                )}
                             </div>

                             <label className="block text-xs text-gray-500 mb-1">Description</label>
                             <textarea 
                               value={product.description} 
                               onChange={(e) => updateProduct(index, 'description', e.target.value)}
                               className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                               rows={2}
                             />
                           </div>
                         </>
                       )}

                     </div>
                   </div>
                 ))}
                 
                 {config.products.length === 0 && (
                   <div className="text-center py-8 text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-lg">
                     No products added yet.
                   </div>
                 )}
               </div>
             </div>
          )}

          {/* DESIGN TAB */}
          {activeTab === 'design' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Select Template</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setConfig({...config, template: 'classic'})}
                    className={`flex flex-col items-center justify-center p-2 border rounded-lg transition-all ${config.template === 'classic' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <IconGrid />
                    <span className="text-[10px] font-medium mt-1">Grid</span>
                  </button>
                  <button 
                    onClick={() => setConfig({...config, template: 'modern'})}
                    className={`flex flex-col items-center justify-center p-2 border rounded-lg transition-all ${config.template === 'modern' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <IconList />
                    <span className="text-[10px] font-medium mt-1">List</span>
                  </button>
                  <button 
                    onClick={() => setConfig({...config, template: 'banner'})}
                    className={`flex flex-col items-center justify-center p-2 border rounded-lg transition-all ${config.template === 'banner' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <IconBanner />
                    <span className="text-[10px] font-medium mt-1">Banner</span>
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Layout Settings</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-gray-700">Email Width</label>
                      <span className="text-xs text-gray-500">{config.layout.contentWidth}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="400" 
                      max="800" 
                      step="10"
                      value={config.layout.contentWidth}
                      onChange={(e) => setConfig({...config, layout: {...config.layout, contentWidth: parseInt(e.target.value)}})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Product Image Scale</label>
                    <div className="flex rounded shadow-sm">
                      <button 
                        onClick={() => setConfig({...config, layout: {...config.layout, productImageSize: 'small'}})}
                        className={`flex-1 py-1.5 text-xs border border-r-0 rounded-l ${config.layout.productImageSize === 'small' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        Small
                      </button>
                      <button 
                        onClick={() => setConfig({...config, layout: {...config.layout, productImageSize: 'medium'}})}
                        className={`flex-1 py-1.5 text-xs border border-r-0 ${config.layout.productImageSize === 'medium' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        Medium
                      </button>
                      <button 
                        onClick={() => setConfig({...config, layout: {...config.layout, productImageSize: 'large'}})}
                        className={`flex-1 py-1.5 text-xs border rounded-r ${config.layout.productImageSize === 'large' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        Large
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Palette</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Primary Color (Buttons)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={config.theme.primaryColor}
                        onChange={(e) => setConfig({...config, theme: {...config.theme, primaryColor: e.target.value}})}
                        className="h-8 w-8 rounded border border-gray-300 cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={config.theme.primaryColor}
                        onChange={(e) => setConfig({...config, theme: {...config.theme, primaryColor: e.target.value}})}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Accent Color (Discounts)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={config.theme.accentColor}
                        onChange={(e) => setConfig({...config, theme: {...config.theme, accentColor: e.target.value}})}
                        className="h-8 w-8 rounded border border-gray-300 cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={config.theme.accentColor}
                        onChange={(e) => setConfig({...config, theme: {...config.theme, accentColor: e.target.value}})}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm uppercase"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={config.theme.backgroundColor}
                        onChange={(e) => setConfig({...config, theme: {...config.theme, backgroundColor: e.target.value}})}
                        className="h-8 w-8 rounded border border-gray-300 cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={config.theme.backgroundColor}
                        onChange={(e) => setConfig({...config, theme: {...config.theme, backgroundColor: e.target.value}})}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- Main Preview --- */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-2 text-sm text-gray-500">
             <span className="font-semibold text-gray-800">Preview</span>
             <span className="hidden md:inline text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{config.layout.contentWidth}px width</span>
          </div>
          <div className="flex items-center gap-3">
             {copyFeedback && (
               <span className="text-green-600 text-sm font-medium animate-pulse">{copyFeedback}</span>
             )}
             <button 
               onClick={copyCode}
               className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition shadow-sm"
             >
               <IconCode /> Source Code
             </button>
             <button 
               onClick={copyVisual}
               className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition shadow-sm"
             >
               <IconCopy /> Copy Visual
             </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-auto p-8 flex justify-center">
           <div className="bg-white shadow-xl min-h-[800px] transition-all duration-300" style={{width: `${config.layout.contentWidth + 50}px`}}>
             <iframe 
               srcDoc={htmlOutput}
               className="w-full h-full min-h-[800px]"
               title="Email Preview"
               sandbox="allow-same-origin"
               style={{border: 'none'}}
             />
           </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);