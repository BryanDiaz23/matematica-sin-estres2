package pe.matematicasinestres.api.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pe.matematicasinestres.api.dto.*;
import pe.matematicasinestres.api.security.UsuarioPrincipal;
import pe.matematicasinestres.api.service.AdminService;
import pe.matematicasinestres.api.service.ClaseService;
import pe.matematicasinestres.api.service.MatriculaService;

import java.util.List;

/**
 * Panel de administración. Doble barrera: regla por URL en SecurityConfig
 * y @PreAuthorize a nivel de clase (defensa en profundidad).
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final ClaseService claseService;
    private final MatriculaService matriculaService;

    public AdminController(AdminService adminService, ClaseService claseService, MatriculaService matriculaService) {
        this.adminService = adminService;
        this.claseService = claseService;
        this.matriculaService = matriculaService;
    }

    @GetMapping("/resumen")
    public ResumenAdminDto resumen() {
        return adminService.resumen();
    }

    // ------------------------------------------------------------ Usuarios
    @GetMapping("/usuarios")
    public List<UsuarioDto> usuarios() {
        return adminService.usuarios();
    }

    @PatchMapping("/usuarios/{id}/estado")
    public UsuarioDto cambiarEstadoUsuario(@PathVariable("id") Long id, @Valid @RequestBody EstadoUsuarioRequest req,
                                           @AuthenticationPrincipal UsuarioPrincipal yo, HttpServletRequest http) {
        return adminService.cambiarEstado(id, req.activo(), yo.getId(), http.getRemoteAddr());
    }

    @PatchMapping("/usuarios/{id}/desbloquear")
    public UsuarioDto desbloquear(@PathVariable("id") Long id, @AuthenticationPrincipal UsuarioPrincipal yo,
                                  HttpServletRequest http) {
        return adminService.desbloquear(id, yo.getId(), http.getRemoteAddr());
    }

    @PatchMapping("/usuarios/{id}/restablecer-password")
    public PasswordTemporalDto restablecerPassword(@PathVariable("id") Long id, @AuthenticationPrincipal UsuarioPrincipal yo,
                                                   HttpServletRequest http) {
        return adminService.restablecerPassword(id, yo.getId(), http.getRemoteAddr());
    }

    // ------------------------------------------------------------ Matrículas
    @GetMapping("/matriculas")
    public List<MatriculaDto> matriculas() {
        return matriculaService.listarTodas();
    }

    @PostMapping("/matriculas")
    @ResponseStatus(HttpStatus.CREATED)
    public MatriculaDto crearMatricula(@Valid @RequestBody MatriculaAdminRequest req) {
        return matriculaService.crearComoAdmin(req);
    }

    @PatchMapping("/matriculas/{id}")
    public MatriculaDto cambiarEstadoMatricula(@PathVariable("id") Long id, @Valid @RequestBody MatriculaEstadoRequest req) {
        return matriculaService.cambiarEstado(id, req);
    }

    // ------------------------------------------------------------ Clases grabadas
    @GetMapping("/clases")
    public List<ClaseAdminDto> clases() {
        return claseService.listarTodas();
    }

    @PostMapping("/clases")
    @ResponseStatus(HttpStatus.CREATED)
    public ClaseDto crearClase(@Valid @RequestBody ClaseRequest req, @AuthenticationPrincipal UsuarioPrincipal yo) {
        return claseService.crear(req, yo.getId());
    }

    @PutMapping("/clases/{id}")
    public ClaseDto actualizarClase(@PathVariable("id") Long id, @Valid @RequestBody ClaseRequest req) {
        return claseService.actualizar(id, req);
    }

    @DeleteMapping("/clases/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarClase(@PathVariable("id") Long id) {
        claseService.eliminar(id);
    }

    // ------------------------------------------------------------ Solicitudes y auditoría
    @GetMapping("/solicitudes")
    public List<SolicitudDto> solicitudes() {
        return adminService.solicitudes();
    }

    @PatchMapping("/solicitudes/{id}/atendida")
    public SolicitudDto marcarAtendida(@PathVariable("id") Long id) {
        return adminService.marcarAtendida(id);
    }

    @GetMapping("/auditoria")
    public List<AuditoriaDto> auditoria() {
        return adminService.auditoria();
    }
}
