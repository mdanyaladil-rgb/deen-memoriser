// lib/transliterate.ts
const harakat = /[\u064B-\u0652\u0670\u0653-\u065F]/g; // strip vowel marks, sukun, etc.

const map: Record<string, string> = {
  'ا':'a','أ':'a','إ':'i','آ':'aa','ء':'’','ؤ':'u','ئ':'i','ى':'a','ﻻ':'la','لا':'la',
  'ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh','د':'d','ذ':'dh','ر':'r','ز':'z',
  'س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'z','ع':'‘','غ':'gh','ف':'f','ق':'q',
  'ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w','ي':'y','ة':'a','ﻷ':'la','ﻹ':'li',
  'َ':'a','ِ':'i','ُ':'u','ٌ':'un','ٍ':'in','ً':'an','ْ':'', 'ٰ':'a'
};

export function transliterate(arabic: string){
  const clean = arabic.replace(harakat, '');
  let out = '';
  for (const ch of clean) out += (map[ch] ?? ch);
  return out.replace(/\s+/g, ' ').replace(/’/g, "'").trim();
}
