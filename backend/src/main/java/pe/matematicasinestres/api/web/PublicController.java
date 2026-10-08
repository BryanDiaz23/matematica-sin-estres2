package pe.matematicasinestres.api.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pe.matematicasinestres.api.dto.*;
import pe.matematicasinestres.api.service.CatalogoService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/** Endpoints públicos (no requieren token). No exponen enlaces de clases ni datos personales. */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final CatalogoService catalogo;

    public PublicController(CatalogoService catalogo) {
        this.catalogo = catalogo;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("estado", "UP", "servicio", "matematica-sin-estres-api", "hora", LocalDateTime.now().toString());
    }

    @GetMapping("/niveles")
    public List<NivelDto> niveles() {
        return catalogo.niveles();
    }

    @GetMapping("/horarios")
    public List<HorarioDto> horarios() {
        return catalogo.horarios();
    }

    @GetMapping("/estadisticas")
    public EstadisticasDto estadisticas() {
        return catalogo.estadisticas();
    }

    @GetMapping("/clases-recientes")
    public List<ClaseResumenDto> clasesRecientes() {
        return catalogo.clasesRecientes();
    }

    @PostMapping("/solicitudes")
    @ResponseStatus(HttpStatus.CREATED)
    public MensajeResponse solicitar(@Valid @RequestBody SolicitudRequest req) {
        return catalogo.registrarSolicitud(req);
    }
}
