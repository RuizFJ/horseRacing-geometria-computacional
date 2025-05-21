// Variables globales
let intervaloCarrera;
let intervaloDesplazamiento;
let juegoActivo = true;

// Inicialización del juego cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    inicializarFondos();
    configurarPantallaBienvenida();
    configurarEventosJuego();
    asegurarElementosJuegoVisibles();
});

function inicializarFondos() {
    if (!localStorage.getItem('fondosJugador') || parseInt(localStorage.getItem('fondosJugador')) <= 0) {
        localStorage.setItem('fondosJugador', '100');
    }
    actualizarMostrarFondos();
}

function configurarPantallaBienvenida() {
    const botonIniciar = document.getElementById('start-game-btn');
    const pantallaBienvenida = document.getElementById('welcome-screen');
    const contenidoJuego = document.getElementById('game-content');
    
    if (!sessionStorage.getItem('juegoIniciado')) {
        pantallaBienvenida.style.display = 'flex';
        contenidoJuego.style.display = 'none';
    } else {
        pantallaBienvenida.style.display = 'none';
        contenidoJuego.style.display = 'block';
    }
    
    botonIniciar.onclick = function() {
        pantallaBienvenida.style.opacity = '0';
        pantallaBienvenida.style.transition = 'opacity 0.5s ease';
        
        setTimeout(function() {
            pantallaBienvenida.style.display = 'none';
            contenidoJuego.style.display = 'block';
            sessionStorage.setItem('juegoIniciado', 'true');
            reiniciarEstadoCarrera();
        }, 500);
    };
}

function configurarEventosJuego() {
    document.getElementById('start').addEventListener('click', function() {
        if (validarApuesta()) {
            iniciarCarrera();
        }
    });

    document.getElementById('play-again-btn').addEventListener('click', function() {
        if (juegoActivo) {
            reiniciarCarrera();
            document.getElementById('race-results').style.display = 'none';
        } else {
            reiniciarJuegoCompleto();
        }
    });
}

function asegurarElementosJuegoVisibles() {
    const caballos = document.querySelectorAll('.horse');
    caballos.forEach(caballo => {
        caballo.style.display = 'block';
        caballo.style.left = '2vw';
        caballo.className = 'horse standRight';
    });

    const pista = document.getElementById('scroll');
    pista.scrollLeft = 0;
    pista.style.overflow = 'auto';
}

function reiniciarEstadoCarrera() {
    for (let i = 1; i <= 4; i++) {
        const caballo = document.getElementById('horse' + i);
        if (caballo) {
            caballo.style.left = '2vw';
            caballo.className = 'horse standRight';
            caballo.style.display = 'block';
        }
    }

    const desplazador = document.getElementById('scroll');
    desplazador.scrollLeft = 0;
    document.getElementById('start').style.display = 'block';
}

function iniciarCarrera() {
    document.getElementById('start').style.display = 'none';
    desplazarPista();
    moverCaballos();
    procesarApuesta();
}

function desplazarPista() {
    intervaloDesplazamiento = setInterval(function() {
        const desplazador = document.getElementById('scroll');
        desplazador.scrollLeft += 1;
    }, 8);
}

function moverCaballos() {
    if (!juegoActivo) return;

    intervaloCarrera = setInterval(function() {
        let caballosTerminados = 0;

        for (let x = 1; x <= 4; x++) {
            const caballo = document.getElementById('horse' + x);
            const posicionActual = caballo.offsetLeft;

            if (posicionActual < window.innerWidth * 3.5) {
                caballo.className = 'horse runRight character runRight';

                if (debeSaltar(posicionActual)) {
                    caballo.className = 'horse runRight jump';
                }

                caballo.style.left = posicionActual + (Math.random() * 3) + 'px';
            } else {
                caballo.className = 'horse standRight';
                caballosTerminados++;
            }
        }

        if (caballosTerminados === 4) {
            terminarCarrera();
        }
    }, 10);
}

function debeSaltar(posicion) {
    const puntosSalto = [0.46, 0.75, 1.15, 1.75, 1.95, 2.45];
    return puntosSalto.some(porcentaje => {
        const punto = window.innerWidth * porcentaje;
        return posicion >= punto - 20 && posicion <= punto + 20;
    });
}

function procesarApuesta() {
    const cantidadApuesta = parseInt(document.getElementById('amount').value);
    let fondos = parseInt(localStorage.getItem('fondosJugador'));

    fondos -= cantidadApuesta;
    localStorage.setItem('fondosJugador', fondos.toString());
    actualizarMostrarFondos();
}

function terminarCarrera() {
    clearInterval(intervaloCarrera);
    clearInterval(intervaloDesplazamiento);

    const resultados = obtenerResultadosCarrera();
    mostrarResultadosFinales(resultados);
    calcularGanancias(resultados[0].id);
    verificarFondos();
}

function obtenerResultadosCarrera() {
    const caballos = [];
    for (let i = 1; i <= 4; i++) {
        const caballo = document.getElementById('horse' + i);
        caballos.push({
            id: 'horse' + i,
            position: caballo.offsetLeft
        });
    }
    return caballos.sort((a, b) => b.position - a.position);
}

function mostrarResultadosFinales(resultados) {
    const divResultados = document.getElementById('final-results');
    divResultados.innerHTML = '';

    resultados.forEach((caballo, indice) => {
        const posicion = ['1° Lugar', '2° Lugar', '3° Lugar', '4° Lugar'][indice];
        divResultados.innerHTML += `<p><strong>${posicion}:</strong> ${obtenerNombreCaballo(caballo.id)}</p>`;
    });

    document.getElementById('race-results').style.display = 'flex';
}

function calcularGanancias(caballoGanador) {
    const caballoApostado = document.getElementById('bethorse').value;
    const cantidadApuesta = parseInt(document.getElementById('amount').value);
    let fondos = parseInt(localStorage.getItem('fondosJugador'));

    if (caballoApostado === caballoGanador) {
        const ganancias = cantidadApuesta * 2;
        fondos += ganancias;
        mostrarMensajeGanador(ganancias);
    }

    localStorage.setItem('fondosJugador', fondos.toString());
    actualizarMostrarFondos();
}

function mostrarMensajeGanador(cantidad) {
    const mensaje = document.createElement('div');
    mensaje.className = 'win-message';
    mensaje.innerHTML = `¡Ganaste £${cantidad}!`;
    document.body.appendChild(mensaje);

    setTimeout(() => mensaje.remove(), 3000);
}

function verificarFondos() {
    const fondos = parseInt(localStorage.getItem('fondosJugador'));

    if (fondos <= 0) {
        juegoActivo = false;
        const divResultados = document.getElementById('final-results');
        divResultados.innerHTML += `<p class="game-over">¡JUEGO TERMINADO! Te has quedado sin fondos.</p>`;
        document.getElementById('play-again-btn').textContent = 'Reiniciar Juego';
    }
}

function reiniciarCarrera() {
    for (let i = 1; i <= 4; i++) {
        const caballo = document.getElementById('horse' + i);
        caballo.style.left = '2vw';
        caballo.className = 'horse standRight';
    }

    const desplazador = document.getElementById('scroll');
    desplazador.scrollLeft = 0;

    document.querySelectorAll('#results td').forEach(celda => celda.className = '');
    document.getElementById('start').style.display = 'block';
}

function reiniciarJuegoCompleto() {
    localStorage.removeItem('fondosJugador');
    sessionStorage.removeItem('juegoIniciado');
    location.reload();
}

function validarApuesta() {
    const cantidadApuesta = parseInt(document.getElementById('amount').value);
    const fondos = parseInt(localStorage.getItem('fondosJugador'));

    if (isNaN(cantidadApuesta) || cantidadApuesta <= 0) {
        alert("Por favor ingresa una cantidad válida mayor que cero");
        return false;
    }

    if (cantidadApuesta > fondos) {
        alert("No tienes suficientes fondos para esta apuesta");
        return false;
    }

    return true;
}

function actualizarMostrarFondos() {
    const fondos = localStorage.getItem('fondosJugador') || '100';
    document.getElementById('funds').textContent = fondos;
}

function obtenerNombreCaballo(idCaballo) {
    const nombres = {
        'horse1': 'Caballo Blanco',
        'horse2': 'Caballo Azul',
        'horse3': 'Caballo Verde',
        'horse4': 'Caballo Marrón'
    };
    return nombres[idCaballo];
}
