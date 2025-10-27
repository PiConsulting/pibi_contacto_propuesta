// Preguntas embebidas en el JS (evitas error de CORS)
const questions = [
  {
    type: "welcome",
    title: "¡Te damos la bienvenida! 😊",
    description: "Nos alegra que tengas interés en nuestra solución.<br>Para poder ayudarte mejor, comenzaremos con tu correo electrónico.<br> Este dato es necesario para enviarte información personalizada según tu escenario ¡Gracias por confiar en nosotros!",
    input: {
      type: "email",
      placeholder: "Correo electrónico"
    },
    button: "Comenzar"
  },
  {
    type: "number",
    title: "¿Cuántos usuarios visores de Power BI te gustaría tener?",
    description: `<span class="tooltip" tabindex="0">${svgInfo()}<span class="tooltip-text">Considere como visores los usuarios que no desarrollan tableros.</span></span>`,
    input: {
      type: "number",
      min: 1,
      max: 1000,
      step: 1,
      placeholder: "Cantidad de visores"
    },
    button: "Siguiente"
  },
  {
    type: "number",
    title: "¿Cuántos informes querés distribuir en esos usuarios?",
    description: "",
    input: {
      type: "number",
      min: 1,
      max: 1000,
      step: 1,
      placeholder: "Cantidad de informes"
    },
    button: "Siguiente"
  },
  {
    type: "number",
    title: "¿Cuál es el peso del modelo semántico más chico? (MBs)",
    description: `<span class="tooltip" tabindex="0">${svgInfo()}<span class="tooltip-text">Podés verlo en la configuración de área de trabajo\no guiarte del peso del archivo.</span></span>`,
    input: {
      type: "number",
      min: 0.1,
      max: 1000,
      step: 0.1,
      placeholder: "Peso en MB"
    },
    button: "Siguiente"
  },
  {
    type: "number",
    title: "¿Cuál es el peso del modelo semántico más grande? (MBs)",
    description: `<span class="tooltip" tabindex="0">${svgInfo()}<span class="tooltip-text">Podés verlo en la configuración de área de trabajo\no guiarte del peso del archivo.</span></span>`,
    input: {
      type: "number",
      min: 0.1,
      max: 10000,
      step: 0.1,
      placeholder: "Peso en MB"
    },
    button: "Siguiente"
  },
  {
    type: "number",
    title: "¿Cuál es el peso promedio de un modelo semántico? (MBs)",
    description: `<span class="tooltip" tabindex="0">${svgInfo()}<span class="tooltip-text">Podés verlo en la configuración de área de trabajo\no guiarte del peso del archivo.</span></span>`,
    input: {
      type: "number",
      min: 0.1,
      max: 10000,
      step: 0.1,
      placeholder: "Peso en MB"
    },
    button: "Siguiente"
  },
  {
    type: "textarea",
    title: "¿Hay algo más que te gustaría comentarnos sobre tu escenario o en general que debamos tener en cuenta?",
    description: "",
    input: {
      type: "textarea",
      placeholder: "Cuéntanos detalles adicionales, necesidades, contexto o cualquier comentario..."
    },
    button: "Finalizar"
  }
];

function svgInfo() {
  // SVG icónico y amigable para info
  return `<svg viewBox="0 0 24 24" fill="none" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#ffc000" stroke="#3f3f46" stroke-width="1.5"/>
    <text x="12" y="16" text-anchor="middle" fill="#3f3f46" font-size="12" font-family="Arial" dy="-.4em">i</text>
  </svg>`;
}

let answers = {};
let currentStep = 0;

function renderStep() {
  const q = questions[currentStep];
  const $container = $('#form-container');
  $container.empty();

  // Animación: fade-in-right para cada pregunta
  const $stepDiv = $('<div class="form-step fade-in-right"></div>');

  // Progreso: arriba de la pregunta, centrado y menos espaciado
  $stepDiv.append(`<div class="progress">${currentStep + 1}/${questions.length}</div>`);

  // Título centrado
  $stepDiv.append(`<h2>${q.title}</h2>`);

  // Descripción: si bienvenida, justificada, el resto centrada
  if (q.type === "welcome") {
    $stepDiv.append(`<div class="description justified">${q.description || ''}</div>`);
  } else {
    $stepDiv.append(`<div class="description">${q.description || ''}</div>`);
  }

  // Input
  let $input;
  const inputDiv = $('<div class="form-input"></div>');
  if (q.input.type === 'email') {
    $input = $(`<input type="email" placeholder="${q.input.placeholder}">`);
    $input.val(answers[currentStep] || '');
    inputDiv.append($input);
  } else if (q.input.type === 'number') {
    $input = $(`<input type="number" min="${q.input.min}" max="${q.input.max}" step="${q.input.step}" placeholder="${q.input.placeholder}">`);
    $input.val(answers[currentStep] || q.input.min || '');
    inputDiv.append($input);
  } else if (q.input.type === 'textarea') {
    $input = $(`<textarea rows="4" placeholder="${q.input.placeholder}"></textarea>`);
    $input.val(answers[currentStep] || '');
    inputDiv.append($input);
  }
  $stepDiv.append(inputDiv);

  // Botones
  const $buttonsDiv = $('<div class="buttons-row"></div>');

  // Botón anterior
  const $prevBtn = $('<button class="secondary-btn">Anterior</button>');
  $prevBtn.css({ visibility: (currentStep === 0) ? 'hidden' : 'visible' });
  $prevBtn.click(() => {
    answers[currentStep] = $input.val();
    currentStep--;
    animateStep(renderStep);
  });
  $buttonsDiv.append($prevBtn);

  // Botón siguiente/finalizar
  const $nextBtn = $(`<button class="main-btn" disabled>${q.button || 'Siguiente'}</button>`);
  $nextBtn.click(() => {
    answers[currentStep] = $input.val();
    currentStep++;
    if (currentStep < questions.length) {
      animateStep(renderStep);
    } else {
      showLoaderAndSummary();
    }
  });
  $buttonsDiv.append($nextBtn);

  $stepDiv.append($buttonsDiv);
  $container.append($stepDiv);

  // Validación en tiempo real
  function validateStep() {
    let valid = false;
    if (q.input.type === 'email') {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($input.val());
    } else if (q.input.type === 'number') {
      const val = $input.val();
      valid = val !== '' &&
        !isNaN(val) &&
        Number(val) >= Number(q.input.min) &&
        Number(val) <= Number(q.input.max);
    } else if (q.input.type === 'textarea') {
      valid = $input.val().trim().length >= 0;
    }
    $nextBtn.prop('disabled', !valid);
  }
  $input.on('input', validateStep);
  validateStep();

  // Accesibilidad para tooltip en móvil (abrir con foco)
  $('.tooltip').on('touchstart keydown', function(e){
    if(e.type === 'touchstart' || e.key === "Enter" || e.key === " "){
      $(this).find('.tooltip-text').css({visibility:"visible",opacity:1});
    }
  }).on('touchend blur', function(){
    $(this).find('.tooltip-text').css({visibility:"hidden",opacity:0});
  });
}

function animateStep(nextFn) {
  $('#form-container').find('.form-step').removeClass('fade-in-right').css('opacity',0);
  setTimeout(nextFn, 120);
}

function showLoaderAndSummary() {
  // Texto modificado: Enviando información
  const loaderHTML = `
    <div class="fullscreen-loader">
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <div class="loader-text">Enviando información...</div>
      </div>
    </div>
  `;
  $('body').append(loaderHTML);
  setTimeout(function() {
    $('.fullscreen-loader').fadeOut(300, function() {
      $(this).remove();
      showSummary();
    });
  }, 1400);
}

function showSummary() {
  $('#form-container').html(`
    <div class="final-message final-bounce-in">
      <h2>¡Gracias por contactarnos! 😊</h2>
      <div class="description">
        Analizaremos tu caso y te daremos una pronta respuesta.<br>
        <strong>Si quieres conocer más información sobre nuestro producto, visita nuestro <a href="https://pibi.com.ar" target="_blank">sitio web</a>.</strong>
      </div>
    </div>
  `);
}

$(document).ready(function(){
  renderStep();
});

function sendFormDataToAzure(formAnswers, onSuccess, onError) {
  const payload = {
    Correo: formAnswers[0] || "",
    Visores: formAnswers[1] || "",
    Informes: formAnswers[2] || "",
    ModelosMIN: formAnswers[3] || "",
    ModelosMAX: formAnswers[4] || "",
    ModelosAVG: formAnswers[5] || "",
    Observacion: formAnswers[6] || ""
  };
  $.ajax({
    url: "https://prod-09.southcentralus.logic.azure.com:443/workflows/7c7443287b3a4f0d9230643dd87299d5/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=VEWZTelxTHfXMK4LPL017Op2bZuO0_YPcDdoqmozLFU",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload),
    success: function(response) {
      if (onSuccess) onSuccess(response);
    },
    error: function(xhr, status, error) {
      if (onError) onError(xhr, status, error);
    }
  });
}

function showLoaderAndSummary() {
  // Pantalla de "Enviando información..."
  const loaderHTML = `
    <div class="fullscreen-loader">
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <div class="loader-text">Enviando información...</div>
      </div>
    </div>
  `;
  $('body').append(loaderHTML);

  // Enviar datos vía AJAX
  sendFormDataToAzure(
    Object.values(answers),
    function success(response) {
      $('.fullscreen-loader').fadeOut(300, function() {
        $(this).remove();
        showSummary();
      });
    },
    function error(xhr, status, error) {
      $('.fullscreen-loader').fadeOut(300, function() {
        $(this).remove();
        $('#form-container').html(`
          <div class="final-message final-bounce-in">
            <h2>Hubo un error al enviar la información.</h2>
            <div class="description">
              Por favor, intenta nuevamente o contáctanos.<br>
              <strong><a href="mailto:soporte@tusitio.com">soporte@tusitio.com</a></strong>
            </div>
          </div>
        `);
      });
    }
  );
}