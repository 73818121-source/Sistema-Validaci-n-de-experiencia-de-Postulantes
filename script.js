// script.js

// === CONFIG - PON AQUÍ LA URL DE APPS SCRIPT (web app) ===
const SCRIPT_URL = 'REEMPLAZAR_CON_URL_DE_APPS_SCRIPT';

// --- Datos fijos (listas) ---
const PROJECT_AREAS = [
  "Seleccionar","PR-Las Bambas (Minería)", "PR-Toromocho", "C.V Juliaca",
  "C.V. Puerto Bermudez", "Puente Tarata", "C.V. Tambogrande",
  "Taller Ate-Chilca"
];

const DEPARTAMENTOS_PERU = [
  "Seleccionar","Amazonas","Áncash","Apurímac","Arequipa","Ayacucho",
  "Cajamarca","Callao","Cusco","Huancavelica","Huánuco",
  "Ica","Junín","La Libertad","Lambayeque","Lima",
  "Loreto","Madre de Dios","Moquegua","Pasco","Piura",
  "Puno","San Martín","Tacna","Tumbes","Ucayali"
];

const EQUIPMENT_TYPES = [
  "Auto Hormigonera","Bus","Calentador de asfalto","Cama baja",
  "Camión Articulado","Camión baranda","Camión Bomba de Concreto",
  "Camión Concretero","Camión Esparcidor de Asfalto","Camión Furgón",
  "Camión Grúa","Camión Imprimador","Camión Lubricador","Camión Plataforma",
  "Camión tracto","Camioneta","Cargador frontal","Chancadora",
  "Cisterna de agua","Cisterna de asfalto","Cisterna de combustible",
  "Coaster","Combi","Esparcidora","Excavadora con Martillo Hidráulico",
  "Excavadora sobre neumáticos","Excavadora sobre orugas","Grúa Celosía",
  "Grúa Telescópica","Grúa Torre","Manlift","Minibús","Montacargador",
  "Motoniveladora","Pavimentadora de asfalto","Perforadora Hidráulica",
  "Planta de asfalto","Planta de Concreto","Plataforma de Elevación",
  "Puente Grúa","Remolque","Retroexcavadora","Rodillo tandem","Telehandler",
  "Van","Volquete (Volvo)","Zaranda"
];

// contador para bloques experiencia
let experienceCounter = 0;

// --- inicialización ---
window.onload = () => {
  populateSelects();
  addExperienceBlock(true);
  attachFormHandlers();
};

// llenar selects
function populateSelects() {
  const projectSelect = document.getElementById('assigned-project');
  PROJECT_AREAS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    projectSelect.appendChild(opt);
  });

  const originSelect = document.getElementById('origin-place');
  DEPARTAMENTOS_PERU.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    originSelect.appendChild(opt);
  });
}

// pestañas
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));

  document.getElementById(`content-${tabId}`).classList.remove('hidden');
  document.getElementById(`tab-${tabId}`).classList.add('active');

  if (tabId === 'summary') loadSummary();
}

// calcular edad
function calculateAge() {
  const dob = document.getElementById('dob').value;
  const display = document.getElementById('age-display');
  if (!dob) {
    display.textContent = 'Edad calculada: -- años';
    return;
  }
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  display.textContent = `Edad calculada: ${age} años`;
}

// --- Experiencias dinámicas ---
function addExperienceBlock(isInitial = false) {
  experienceCounter++;
  const container = document.getElementById('experience-container');
  const expId = `exp-${experienceCounter}`;

  const block = document.createElement('div');
  block.id = expId;
  block.className = 'p-4 border rounded-lg bg-white';

  // Opciones de equipos
  const equipmentOptions = EQUIPMENT_TYPES.map(eq => `<option value="${eq}">${eq}</option>`).join('');

  block.innerHTML = `
    <h4 class="text-sm font-semibold text-gray-700 mb-2">Experiencia #${experienceCounter} <span id="duration-${expId}" class="text-xs text-blue-600 font-normal">(Duración: --)</span></h4>
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-500">Equipo a Cargo</label>
        <select data-field="equipment" class="mt-1 block w-full border rounded p-2 exp-field" required>
          <option value="" disabled selected>Seleccionar</option>
          ${equipmentOptions}
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500">Empresa - Razón social</label>
        <input type="text" data-field="company" class="mt-1 block w-full border rounded p-2 exp-field" placeholder="Ejm : Mota engil peru" required>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500">F. Inicial</label>
        <input type="date" data-field="startDate" class="mt-1 block w-full border rounded p-2 exp-field" required>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500">F. Final</label>
        <input type="date" data-field="endDate" class="mt-1 block w-full border rounded p-2 exp-field" required>
      </div>
    </div>
    <div class="flex justify-end mt-3">
      <button type="button" class="text-red-500 hover:text-red-700 text-xs font-semibold p-1 rounded remove-exp">Eliminar</button>
    </div>
  `;

  container.appendChild(block);

  // listeners
  block.querySelectorAll('[data-field="startDate"], [data-field="endDate"]').forEach(i => {
    i.addEventListener('change', () => updateExperienceDuration(expId));
  });

  block.querySelector('[data-field="equipment"]').addEventListener('change', calculateTotalExperience);
  block.querySelector('.remove-exp').addEventListener('click', () => {
    block.remove();
    calculateTotalExperience();
  });

  if (!isInitial) calculateTotalExperience();
  updateExperienceDuration(expId);
}

function updateExperienceDuration(id) {
  const block = document.getElementById(id);
  if (!block) return;
  const start = block.querySelector('[data-field="startDate"]').value;
  const end = block.querySelector('[data-field="endDate"]').value;
  const span = document.getElementById(`duration-${id}`);
  const duration = calculateDuration(start, end);
  span.textContent = `(Duración: ${duration || '--'})`;
  calculateTotalExperience();
}

function calculateDuration(startStr, endStr) {
  if (!startStr || !endStr) return '';
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (start > end) return 'Fechas inválidas';
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  const yearStr = years > 0 ? `${years} año${years !== 1 ? 's' : ''}` : '';
  const monthStr = months > 0 ? `${months} mes${months !== 1 ? 'es' : ''}` : '';
  if (!yearStr && !monthStr) return 'Menos de 1 mes';
  return [yearStr, monthStr].filter(Boolean).join(', ');
}

function calculateTotalExperience() {
  const container = document.getElementById('experience-container');
  const blocks = container.querySelectorAll('.p-4');
  const experienceData = [];
  const summary = {};

  blocks.forEach(block => {
    const start = block.querySelector('[data-field="startDate"]').value;
    const end = block.querySelector('[data-field="endDate"]').value;
    const equipment = block.querySelector('[data-field="equipment"]').value;
    const company = block.querySelector('[data-field="company"]').value;

    if (start && end && equipment && company) {
      const s = new Date(start);
      const e = new Date(end);
      if (s > e) return; // ignorar fechas inválidas

      const diffDays = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24));
      experienceData.push({ equipment, company, startDate: start, endDate: end, days: diffDays });

      if (!summary[equipment]) summary[equipment] = 0;
      summary[equipment] += diffDays;
    }
  });

  // formatear resumen
  let summaryHtml = '';
  let totalDays = 0;
  for (const eq in summary) {
    const days = summary[eq];
    const totalMonths = Math.floor(days / 30.44);
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const yearStr = years > 0 ? `${years} año${years !== 1 ? 's' : ''}` : '';
    const monthStr = months > 0 ? `${months} mes${months !== 1 ? 'es' : ''}` : '';
    const durationStr = [yearStr, monthStr].filter(Boolean).join(', ');
    summaryHtml += `<span class="block ml-4">• ${eq} (${durationStr || 'Menos de 1 mes'})</span>`;
    totalDays += days;
  }

  const totalMonths = Math.floor(totalDays / 30.44);
  const totalYears = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;
  const totalYearStr = totalYears > 0 ? `${totalYears} año${totalYears !== 1 ? 's' : ''}` : '';
  const totalMonthStr = remainingMonths > 0 ? `${remainingMonths} mes${remainingMonths !== 1 ? 'es' : ''}` : '';
  const totalDurationStr = [totalYearStr, totalMonthStr].filter(Boolean).join(', ');

  const summaryDiv = document.getElementById('experience-summary');
  if (summaryHtml) {
    summaryDiv.innerHTML = `
      <p class="font-bold">Resumen de Experiencia por Equipo:</p>
      ${summaryHtml}
      <p class="mt-2 text-xs text-gray-600">Experiencia Total Acumulada: <span class="font-semibold text-green-700">${totalDurationStr || 'Menos de 1 mes'}</span></p>
    `;
  } else {
    summaryDiv.innerHTML = 'Resumen de Experiencia por Equipo: <span class="text-green-700">No hay experiencia registrada.</span>';
  }

  document.getElementById('experience-json-data').value = JSON.stringify(experienceData);
}

// limpiar experiencias
function clearExperiences() {
  document.getElementById('experience-container').innerHTML = '';
  experienceCounter = 0;
  addExperienceBlock(true);
  calculateTotalExperience();
  clearEvaluationEquipmentCheckboxes();
}

// --- Conexión Apps Script ---
async function fetchAppsScript(action, data) {
  if (SCRIPT_URL === 'REEMPLAZAR_CON_URL_DE_APPS_SCRIPT') {
    showMessage('Error: configura SCRIPT_URL con la URL de tu Apps Script.', 'error');
    return { status: 'error', message: 'Configuración pendiente' };
  }

  const payload = { action, data };
  showMessage((action === 'register') ? 'Guardando registro...' : 'Consultando datos...', 'info');

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const text = await res.text();
      return { status: 'error', message: `HTTP ${res.status} - ${text}` };
    }
    const json = await res.json();
    return json;
  } catch (err) {
    console.error(err);
    return { status: 'error', message: err.message || 'Error de conexión' };
  }
}

// mostrar mensajes
function showMessage(msg, type='info', duration=6000) {
  const box = document.getElementById('message-container');
  box.className = 'mt-4 text-sm font-medium p-3 rounded-lg';
  box.style.display = 'block';
  if (type === 'success') box.classList.add('text-green-700','bg-green-100');
  else if (type === 'error') box.classList.add('text-red-700','bg-red-100');
  else if (type === 'warning') box.classList.add('text-yellow-700','bg-yellow-100');
  else box.classList.add('text-blue-700','bg-blue-50');

  box.textContent = msg;
  setTimeout(() => {
    box.textContent = '';
    box.style.display = 'none';
  }, duration);
}

// --- Form handlers ---
function attachFormHandlers() {
  // botones experiencia
  document.getElementById('add-exp-btn').addEventListener('click', () => addExperienceBlock(false));
  document.getElementById('clear-exp-btn').addEventListener('click', clearExperiences);

  // resetar formulario (sin borrar RRHH)
  document.getElementById('reset-form').addEventListener('click', () => {
    const hrResponsible = document.getElementById('hr-responsible').value;
    const hrPosition = document.getElementById('hr-position').value;
    document.getElementById('registration-form').reset();
    document.getElementById('hr-responsible').value = hrResponsible;
    document.getElementById('hr-position').value = hrPosition;
    clearExperiences();clearEvaluationEquipmentCheckboxes(); // 🔹 limpia también equipos
  });

  // envio
  document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    calculateTotalExperience();

    const hrResponsible = document.getElementById('hr-responsible').value.trim();
    const hrPosition = document.getElementById('hr-position').value.trim();
    if (!hrResponsible || !hrPosition) {
      showMessage('Por favor completa los campos de Responsable de RRHH.', 'warning');
      return;
    }

    const experienceJson = document.getElementById('experience-json-data').value || '[]';
    const fileInput = document.getElementById('document-upload');

    const data = {
      hrResponsible,
      hrPosition,
      dni: document.getElementById('dni').value.trim(),
      names: document.getElementById('names').value.trim(),
      surnames: document.getElementById('surnames').value.trim(),
      dob: document.getElementById('dob').value,
      licenseCategory: document.getElementById('license-category').value,
      revalidationDate: document.getElementById('revalidation-date').value,
      originPlace: document.getElementById('origin-place').value,
      assignedProject: document.getElementById('assigned-project').value,
      evaluationDate: document.getElementById('evaluation-datetime').value,
      experienceData: experienceJson,
      documentName: fileInput.files.length > 0 ? fileInput.files[0].name : '',
      observations: document.getElementById('observations').value.trim()
    };

    if (!data.dni) {
      showMessage('El campo DNI es obligatorio.', 'warning');
      return;
    }

    const result = await fetchAppsScript('register', data);
    if (result.status === 'success') {
      showMessage(result.message || 'Registro guardado correctamente.', 'success');
      // reset excepto RRHH
      const hrRes = data.hrResponsible;
      const hrPos = data.hrPosition;
      document.getElementById('registration-form').reset();
      document.getElementById('hr-responsible').value = hrRes;
      document.getElementById('hr-position').value = hrPos;
      clearExperiences();
    } else {
      showMessage(`Error al registrar: ${result.message}`, 'error');
    }
  });
}

// --- Resumen (leer últimos N) ---
async function loadSummary() {
  const res = await fetchAppsScript('get_summary', { limit: 10 });
  const body = document.getElementById('summary-table-body');
  body.innerHTML = '';
  if (res.status === 'success' && Array.isArray(res.data) && res.data.length) {
    renderSummaryTable(res.data);
  } else if (res.status === 'success') {
    body.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">No hay registros.</td></tr>';
  } else {
    body.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-red-500">Error: ${res.message}</td></tr>`;
  }
}



// === SECCIÓN: Checkboxes para equipos a evaluar (≥ 3 años de experiencia) ===
function updateEvaluationEquipmentCheckboxes() {
  const list = document.getElementById('evaluation-equipment-list');
  if (!list) return;

  // Limpiar contenido actual
  list.innerHTML = '';

  // Recolectar experiencia por equipo
  const container = document.getElementById('experience-container');
  const blocks = container.querySelectorAll('.p-4');
  const summary = {};

  blocks.forEach(block => {
    const start = block.querySelector('[data-field="startDate"]').value;
    const end = block.querySelector('[data-field="endDate"]').value;
    const equipment = block.querySelector('[data-field="equipment"]').value;
    if (start && end && equipment) {
      const s = new Date(start);
      const e = new Date(end);
      const diffDays = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24));
      if (!summary[equipment]) summary[equipment] = 0;
      summary[equipment] += diffDays;
    }
  });

  // Equipos con más de 3 años (~1095 días)
  const qualified = Object.keys(summary).filter(eq => summary[eq] >= 1095);

  if (qualified.length === 0) {
    list.innerHTML = '<p class="text-red-500 text-sm col-span-full">No cumple 3 años de experiencia en ningún equipo.</p>';
    return;
  }

  // Crear un checkbox por cada equipo calificado
  qualified.forEach(eq => {
    const label = document.createElement('label');
    label.className = 'flex items-center space-x-2 text-sm bg-gray-50 border p-2 rounded-lg cursor-pointer hover:bg-gray-100';
    label.innerHTML = `
      <input type="checkbox" class="evaluation-equipment-checkbox accent-blue-600" value="${eq}">
      <span>${eq}</span>
    `;
    list.appendChild(label);
  });
}

// Actualizar automáticamente al cambiar experiencia
document.addEventListener('change', (e) => {
  if (e.target.matches('[data-field="startDate"], [data-field="endDate"], [data-field="equipment"]')) {
    updateEvaluationEquipmentCheckboxes();
  }
});

// === LIMPIAR CHECKBOXES DE EQUIPOS A EVALUAR ===
function clearEvaluationEquipmentCheckboxes() {
  const list = document.getElementById('evaluation-equipment-list');
  if (list) {
    list.innerHTML = `
      <p class="text-gray-500 text-sm col-span-full">
        Seleccione los equipos en los que el postulante tiene más de 3 años de experiencia.
      </p>
    `;
  }
}


function renderSummaryTable(rows) {
  const body = document.getElementById('summary-table-body');
  rows.forEach((row, idx) => {
    // row: array con columnas tal como las escribimos en Apps Script
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50';
    const dni = row[1] || '';
    const names = row[2] || '';
    const surnames = row[3] || '';
    const license = row[4] || '';
    const project = row[9] || '';
    tr.innerHTML = `
      <td class="px-3 py-3 text-sm font-medium">${idx+1}</td>
      <td class="px-3 py-3 text-sm">${dni}</td>
      <td class="px-3 py-3 text-sm">${names} ${surnames}</td>
      <td class="px-3 py-3 text-sm">${license}</td>
      <td class="px-3 py-3 text-sm">${project}</td>
      <td class="px-3 py-3 text-sm">
        <!-- aquí podrías añadir botones editar / ver -->
        <button class="text-blue-600 hover:text-blue-900 font-semibold p-1 rounded-md bg-blue-50">Ver</button>
      </td>
    `;
    body.appendChild(tr);
  });
}