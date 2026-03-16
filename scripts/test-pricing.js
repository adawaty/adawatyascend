/* Minimal sanity tests for pricing calculator logic.
   Run: node scripts/test-pricing.js
*/

function calc({ includeWebsite=true, websiteType='one-page', includeBio=false, bioType='classic', hostingTier='starter', addons={} }){
  const items=[];
  let totalOneTime=0;
  let totalMonthly=0;
  let minWeeks=1;
  let maxWeeks=1;

  const addItem=(name, oneTime=0, monthly=0, tMin=0, tMax=0)=>{
    items.push({name, oneTime, monthly});
    totalOneTime+=oneTime;
    totalMonthly+=monthly;
    minWeeks+=tMin;
    maxWeeks+=tMax;
  };

  if(includeWebsite){
    const web={
      'one-page': { name: 'Website (One-page)', oneTime: 650, tMin: 1, tMax: 2 },
      'multi-page': { name: 'Website (Multi-page)', oneTime: 1600, tMin: 2, tMax: 3 },
      ecommerce: { name: 'Website (eCommerce)', oneTime: 2600, tMin: 3, tMax: 5 },
    };
    const w=web[websiteType] || web['multi-page'];
    addItem(w.name, w.oneTime, 0, w.tMin, w.tMax);
  }

  if(includeBio){
    const bio={
      classic: { name: 'Personal Bio Page', oneTime: 249, tMin: 0.5, tMax: 1 },
      pro: { name: 'Personal Bio (Pro)', oneTime: 399, tMin: 0.5, tMax: 1 },
    };
    const b=bio[bioType] || bio.classic;
    addItem(b.name, b.oneTime, 0, b.tMin, b.tMax);
  }

  const host={
    starter: { name: 'Starter Hosting', monthly: 19 },
    standard: { name: 'Standard Hosting', monthly: 29 },
    pro: { name: 'Pro Hosting', monthly: 39 },
    business: { name: 'Business Hosting', monthly: 49 },
  };
  const h=host[hostingTier] || host.pro;
  addItem(h.name, 0, h.monthly, 0, 0);

  const ADD={
    copy: { name: 'Copy + Positioning', oneTime: 350, tMin: 0.5, tMax: 1 },
    booking: { name: 'Scheduling + WhatsApp', oneTime: 150, tMin: 0, tMax: 0.5 },
    seo: { name: 'SEO Foundation', oneTime: 450, tMin: 0.5, tMax: 1 },
    aeo: { name: 'AI Overview / AEO Pack', oneTime: 350, tMin: 0.5, tMax: 1 },
    analytics: { name: 'Analytics + Pixels', oneTime: 250, tMin: 0, tMax: 0.5 },
    branding: { name: 'Brand System Lite', oneTime: 550, tMin: 0.5, tMax: 1.5 },
    screens: { name: 'Client Screenshots + Niches', oneTime: 180, tMin: 0, tMax: 0.5 },
    growth: { name: 'Growth Plan (SEO + AEO + Content)', monthly: 699 },
    cro: { name: 'CRO Experiments', monthly: 299 },
    care: { name: 'Reliability Monitoring', monthly: 49 },
  };

  Object.entries(ADD).forEach(([k,v])=>{ if(addons[k]) addItem(v.name, v.oneTime||0, v.monthly||0, v.tMin||0, v.tMax||0); });

  minWeeks = Math.max(1, Math.round(minWeeks * 2) / 2);
  maxWeeks = Math.max(minWeeks, Math.round(maxWeeks * 2) / 2);

  return { totalOneTime, totalMonthly, minWeeks, maxWeeks, items };
}

function assertEqual(actual, expected, msg){
  if(actual!==expected){
    console.error('FAIL:', msg, {actual, expected});
    process.exitCode=1;
  } else {
    console.log('OK:', msg);
  }
}

// baseline: one-page + starter hosting
{
  const r=calc({ includeWebsite:true, websiteType:'one-page', hostingTier:'starter', addons:{} });
  assertEqual(r.totalOneTime, 650, 'one-page one-time is 650');
  assertEqual(r.totalMonthly, 19, 'starter hosting monthly is 19');
}

// add booking
{
  const r=calc({ includeWebsite:true, websiteType:'one-page', hostingTier:'starter', addons:{ booking:true } });
  assertEqual(r.totalOneTime, 800, 'one-page + booking one-time is 800');
  assertEqual(r.totalMonthly, 19, 'monthly unchanged');
}

// growth monthly add-on
{
  const r=calc({ includeWebsite:true, websiteType:'one-page', hostingTier:'starter', addons:{ growth:true } });
  assertEqual(r.totalOneTime, 650, 'growth does not change one-time');
  assertEqual(r.totalMonthly, 718, 'starter + growth monthly is 718');
}

if(process.exitCode===1){
  console.error('Some tests failed.');
} else {
  console.log('All tests passed.');
}
