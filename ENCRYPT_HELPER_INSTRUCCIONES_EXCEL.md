# 📊 INSTRUCCIONES PARA IMPORTAR EN EXCEL

## 📁 Archivos Generados

Se han creado 7 archivos CSV que puedes importar en Excel:

1. **ENCRYPT_HELPER_TAREAS.csv** - Lista completa de todas las tareas (38 tareas)
2. **ENCRYPT_HELPER_RESUMEN.csv** - Resumen ejecutivo con métricas
3. **ENCRYPT_HELPER_SPRINTS.csv** - Planificación detallada por sprints
4. **ENCRYPT_HELPER_RICE_MATRIZ.csv** - Matriz de priorización RICE
5. **ENCRYPT_HELPER_CRITERIOS_ACEPTACION.csv** - Definition of Done por sprint
6. **ENCRYPT_HELPER_TRACKING.csv** - Tracking diario de progreso
7. **ENCRYPT_HELPER_RECURSOS.csv** - Recursos y herramientas necesarias

---

## 🚀 OPCIÓN 1: IMPORTAR A UN SOLO LIBRO DE EXCEL

### **Paso 1: Crear nuevo libro de Excel**
1. Abrir Microsoft Excel
2. Crear nuevo libro en blanco
3. Guardar como: `ENCRYPT_HELPER_PROYECTO.xlsx`

### **Paso 2: Importar cada archivo como hoja separada**

Para cada archivo CSV:

1. Click derecho en las pestañas de hojas (abajo)
2. Seleccionar "Insertar" → "Hoja de Cálculo"
3. Ir a **Datos** → **Obtener datos externos** → **Desde texto/CSV**
4. Seleccionar el archivo CSV correspondiente
5. En el asistente de importación:
   - Delimitador: **Coma**
   - Codificación: **UTF-8**
   - Tipo de datos: **Detectar automáticamente**
6. Click "Cargar"
7. Renombrar la hoja con el nombre descriptivo:
   - Hoja 1: `Tareas`
   - Hoja 2: `Resumen`
   - Hoja 3: `Sprints`
   - Hoja 4: `Priorización RICE`
   - Hoja 5: `Criterios Aceptación`
   - Hoja 6: `Tracking`
   - Hoja 7: `Recursos`

### **Paso 3: Formatear las hojas**

**Para todas las hojas:**
1. Seleccionar fila 1 (headers)
2. Aplicar negrita (Ctrl + B)
3. Aplicar color de fondo (Azul claro recomendado)
4. Congelar paneles: **Vista** → **Inmovilizar** → **Inmovilizar fila superior**
5. Ajustar ancho de columnas: Seleccionar todas → Doble click en borde de columna

**Formateo específico por hoja:**

#### **Hoja "Tareas":**
```
Columna "Prioridad":
- CRÍTICA → Fondo rojo, texto blanco
- ALTA → Fondo naranja, texto blanco
- MEDIA → Fondo amarillo, texto negro
- BAJA → Fondo verde, texto blanco

Columna "Estado":
- Pendiente → Fondo gris claro
- En Progreso → Fondo azul claro
- Completado → Fondo verde claro
- Bloqueado → Fondo rojo claro

Columna "Sprint":
- Aplicar filtro: Datos → Filtro
```

#### **Hoja "Resumen":**
```
- Aplicar formato de tabla: Insertar → Tabla
- Agregar gráficos:
  1. Gráfico de pastel para "Tareas por Categoría"
  2. Gráfico de barras para "Esfuerzo por Categoría"
  3. Gráfico de dona para "Distribución de Prioridades"
```

#### **Hoja "Sprints":**
```
- Agrupar por Sprint:
  1. Seleccionar filas de Sprint 1
  2. Datos → Agrupar → Agrupar filas
  3. Repetir para cada sprint

- Resaltar filas SUBTOTAL y ENTREGABLES con color diferente
```

#### **Hoja "Priorización RICE":**
```
Columna "RICE Score":
- Formato condicional:
  - >300 → Verde oscuro
  - 200-300 → Verde claro
  - 100-200 → Amarillo
  - 50-100 → Naranja
  - <50 → Rojo

Columna "Ranking":
- Ordenar de menor a mayor (1 = más prioritario)
```

#### **Hoja "Tracking":**
```
Columna "% Progreso":
- Formato: Porcentaje con 1 decimal
- Formato condicional: Barra de datos

Columna "Estado":
- Mismas reglas que hoja "Tareas"

- Crear gráfico de burndown:
  1. Seleccionar columnas: Día, Tareas Pendientes, Ideal
  2. Insertar → Gráfico de líneas
  3. Título: "Sprint Burndown Chart"
```

---

## 🚀 OPCIÓN 2: SCRIPT AUTOMÁTICO DE FORMATEO

Si prefieres automatizar el formateo, puedes usar este script de VBA:

### **Paso 1: Abrir Editor de VBA**
1. Presionar `Alt + F11` en Excel
2. Insertar → Módulo
3. Copiar y pegar el siguiente código:

```vba
Sub FormatearEncryptHelperProject()
    Dim ws As Worksheet

    ' Formatear todas las hojas
    For Each ws In ThisWorkbook.Worksheets
        With ws
            ' Formatear headers
            .Rows(1).Font.Bold = True
            .Rows(1).Interior.Color = RGB(68, 114, 196)
            .Rows(1).Font.Color = RGB(255, 255, 255)

            ' Inmovilizar fila superior
            .Activate
            .Rows(2).Select
            ActiveWindow.FreezePanes = True

            ' Ajustar ancho de columnas
            .Columns.AutoFit
        End With
    Next ws

    MsgBox "Formateo completado exitosamente!", vbInformation
End Sub
```

### **Paso 2: Ejecutar el script**
1. Presionar `F5` o click en "Ejecutar"
2. El script formateará automáticamente todas las hojas

---

## 📊 OPCIÓN 3: CREAR DASHBOARD INTERACTIVO

### **Dashboard Principal (Nueva hoja)**

1. Crear nueva hoja llamada "Dashboard"
2. Agregar los siguientes elementos:

#### **A. Métricas Clave (Tarjetas)**
```
┌─────────────────────────────────────────────────────────┐
│  Total Tareas: 38  │  Completadas: 0  │  Progreso: 0%   │
├─────────────────────────────────────────────────────────┤
│  Críticas: 6       │  Altas: 14       │  Medias: 14     │
└─────────────────────────────────────────────────────────┘
```

Fórmulas:
- Total Tareas: `=COUNTA(Tareas!A:A)-1`
- Completadas: `=COUNTIF(Tareas!L:L,"Completado")`
- Progreso: `=Completadas/Total*100`

#### **B. Gráfico de Progreso por Sprint**
```
Tipo: Gráfico de barras apiladas
Datos: De hoja "Sprints", columna "Tareas Completadas" vs "Tareas Totales"
```

#### **C. Tabla de Tareas Críticas**
```
Filtrar hoja "Tareas" por Prioridad = "CRÍTICA"
Mostrar: ID, Tarea, Sprint, Estado, Asignado A
```

#### **D. Burndown Chart**
```
Tipo: Gráfico de líneas
Datos: De hoja "Tracking", sección BURNDOWN
Líneas: Ideal vs Real
```

#### **E. Distribución de Esfuerzo**
```
Tipo: Gráfico de pastel
Datos: De hoja "Resumen", tabla de categorías
Mostrar: % por categoría (Seguridad, Performance, etc.)
```

---

## 🎨 PLANTILLA DE COLORES RECOMENDADA

```
Prioridades:
- P0 Crítica: #C00000 (Rojo oscuro)
- P1 Alta: #FF6600 (Naranja)
- P2 Media: #FFD700 (Amarillo/Dorado)
- P3 Baja: #00B050 (Verde)

Estados:
- Pendiente: #D3D3D3 (Gris claro)
- En Progreso: #4472C4 (Azul)
- Completado: #70AD47 (Verde claro)
- Bloqueado: #FF0000 (Rojo)

Categorías:
- Seguridad: #C00000 (Rojo)
- Performance: #FFC000 (Naranja)
- Arquitectura: #5B9BD5 (Azul)
- Testing: #70AD47 (Verde)
- Código Limpio: #A5A5A5 (Gris)
- Documentación: #7030A0 (Morado)
```

---

## 🔧 FÓRMULAS ÚTILES PARA TRACKING

### **Calcular % de progreso:**
```excel
=COUNTIF(Tareas!L:L,"Completado")/COUNTA(Tareas!A:A)-1
```

### **Contar tareas por sprint:**
```excel
=COUNTIFS(Tareas!H:H,"1",Tareas!L:L,"Completado")
```

### **Calcular velocity (tareas/día):**
```excel
=Completadas/Días_Transcurridos
```

### **Estimar fecha de finalización:**
```excel
=HOY()+((Total_Tareas-Completadas)/Velocity)
```

### **Identificar tareas en riesgo (sin progreso en 3+ días):**
```excel
=IF(AND(L2="En Progreso",HOY()-M2>3),"⚠️ RIESGO","✅ OK")
```

---

## 📱 ALTERNATIVAS A EXCEL

Si prefieres otras herramientas:

### **Google Sheets**
1. Ir a Google Sheets
2. Archivo → Importar → Cargar
3. Seleccionar CSV
4. Repetir para cada archivo
5. Ventaja: Colaboración en tiempo real

### **Notion**
1. Crear nueva página "Encrypt Helper Project"
2. Agregar Database → Importar CSV
3. Ventaja: Mejor visualización y filtros

### **Jira / Trello**
1. Importar CSV directamente como issues/cards
2. Configurar columnas por estado
3. Ventaja: Tracking automático y notificaciones

### **Airtable**
1. Crear nueva base
2. Importar CSV
3. Crear vistas: Kanban, Calendar, Gantt
4. Ventaja: Múltiples vistas interactivas

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### **Problema: Caracteres extraños al importar**
**Solución:** Asegurarse de usar codificación UTF-8

### **Problema: Columnas no se separan correctamente**
**Solución:** Verificar que el delimitador es "coma" (,)

### **Problema: Fechas se importan mal**
**Solución:** Formatear columna como "Texto" antes de importar

### **Problema: Fórmulas no funcionan**
**Solución:** Verificar que los nombres de hojas coinciden exactamente

---

## 📞 SOPORTE

Si tienes problemas con la importación:

1. Verificar que los archivos CSV están en la carpeta del proyecto
2. Abrir archivos CSV con editor de texto para verificar formato
3. Consultar documentación oficial de Excel para tu versión
4. Contactar al equipo de desarrollo

---

## 🎯 PRÓXIMOS PASOS

Una vez importado en Excel:

1. ✅ Revisar todas las tareas con el equipo
2. ✅ Asignar desarrolladores a cada tarea
3. ✅ Establecer fechas de inicio/fin
4. ✅ Configurar daily standups para actualizar tracking
5. ✅ Crear alertas para tareas en riesgo
6. ✅ Configurar notificaciones de bloqueadores

---

**Última actualización:** 2025-01-31
**Versión:** 1.0
**Proyecto:** IPH Frontend - Encrypt Helper Refactorización
