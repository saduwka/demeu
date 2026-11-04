/**
 * Демеу · Қырқынан шығару — приём ответов гостей в Google Таблицу.
 * Вставьте этот код в таблице: Расширения → Apps Script, затем Развернуть → Новое развертывание → Веб-приложение.
 */
const SHEET_NAME = 'Жауаптар';

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return json_({ ok: true });             // защита от ботов (скрытое поле)

  const name = clean_(p.name, 100);
  if (!name) return json_({ ok: false, error: 'name' });

  const coming = p.answer !== 'no';
  const count = coming ? Math.max(1, Math.min(15, parseInt(p.count, 10) || 1)) : 0;
  const wish = clean_(p.wish, 1000);
  const lang = p.lang === 'ru' ? 'RU' : 'KZ';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    sheet.appendRow([new Date(), name, coming ? 'Келеді' : 'Келмейді', count, wish, lang]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function doGet() {
  return json_({ ok: true, service: 'demeu-rsvp' });
}

// Обрезает строку и не даёт тексту гостя превратиться в формулу (=, +, -, @)
function clean_(v, max) {
  let s = String(v || '').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
