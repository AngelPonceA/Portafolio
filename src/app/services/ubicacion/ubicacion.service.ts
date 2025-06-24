import { Injectable } from '@angular/core';
import { Region } from '../../models/region.models'; 
import { Firestore, query, where, getDocs } from '@angular/fire/firestore';
import { collection as fsCollection } from 'firebase/firestore';
@Injectable({
  providedIn: 'root'
})
export class UbicacionService {

  private regiones: Region[] = [
    {
      id: 1,
      nombre: "Arica y Parinacota",
      numero: "XV",
      comunas: [
        "Arica",
        "Camarones",
        "Putre",
        "General Lagos"
      ]
    },
    {
      id: 2,
      nombre: "Tarapacá",
      numero: "I",
      comunas: [
        "Iquique",
        "Alto Hospicio",
        "Pozo Almonte",
        "Camiña",
        "Colchane",
        "Huara",
        "Pica"
      ]
    },
    {
      id: 3,
      nombre: "Antofagasta",
      numero: "II",
      comunas: [
        "Antofagasta",
        "Mejillones",
        "Sierra Gorda",
        "Taltal",
        "Calama",
        "Ollagüe",
        "San Pedro de Atacama",
        "Tocopilla",
        "María Elena"
      ]
    },
    {
      id: 4,
      nombre: "Atacama",
      numero: "III",
      comunas: [
        "Copiapó",
        "Caldera",
        "Tierra Amarilla",
        "Chañaral",
        "Diego de Almagro",
        "Vallenar",
        "Alto del Carmen",
        "Freirina",
        "Huasco"
      ]
    },
    {
      id: 5,
      nombre: "Coquimbo",
      numero: "IV",
      comunas: [
        "La Serena",
        "Coquimbo",
        "Andacollo",
        "La Higuera",
        "Paihuano",
        "Vicuña",
        "Illapel",
        "Canela",
        "Los Vilos",
        "Salamanca",
        "Ovalle",
        "Combarbalá",
        "Monte Patria",
        "Punitaqui",
        "Río Hurtado"
      ]
    },
    {
      id: 6,
      nombre: "Valparaíso",
      numero: "V",
      comunas: [
        "Valparaíso",
        "Casablanca",
        "Concón",
        "Juan Fernández",
        "Puchuncaví",
        "Quintero",
        "Viña del Mar",
        "Isla de Pascua",
        "Los Andes",
        "Calle Larga",
        "Rinconada",
        "San Esteban",
        "La Ligua",
        "Cabildo",
        "Papudo",
        "Petorca",
        "Zapallar",
        "Quillota",
        "Calera",
        "Hijuelas",
        "La Cruz",
        "Nogales",
        "San Antonio",
        "Algarrobo",
        "Cartagena",
        "El Quisco",
        "El Tabo",
        "Santo Domingo",
        "San Felipe",
        "Catemu",
        "Llaillay",
        "Panquehue",
        "Putaendo",
        "Santa María"
      ]
    },
    {
      id: 7,
      nombre: "Metropolitana de Santiago",
      numero: "RM",
      comunas: [
        "Santiago",
        "Cerrillos",
        "Cerro Navia",
        "Conchalí",
        "El Bosque",
        "Estación Central",
        "Huechuraba",
        "Independencia",
        "La Cisterna",
        "La Florida",
        "La Granja",
        "La Pintana",
        "La Reina",
        "Las Condes",
        "Lo Barnechea",
        "Lo Espejo",
        "Lo Prado",
        "Macul",
        "Maipú",
        "Ñuñoa",
        "Pedro Aguirre Cerda",
        "Peñalolén",
        "Providencia",
        "Pudahuel",
        "Quilicura",
        "Quinta Normal",
        "Recoleta",
        "Renca",
        "San Joaquín",
        "San Miguel",
        "San Ramón",
        "Vitacura",
        "Puente Alto",
        "Pirque",
        "San José de Maipo",
        "Colina",
        "Lampa",
        "Tiltil",
        "San Bernardo",
        "Buin",
        "Calera de Tango",
        "Paine",
        "Melipilla",
        "Alhué",
        "Curacaví",
        "María Pinto",
        "San Pedro",
        "Talagante",
        "El Monte",
        "Isla de Maipo",
        "Padre Hurtado",
        "Peñaflor"
      ]
    },
    {
      id: 8,
      nombre: "Libertador General Bernardo O'Higgins",
      numero: "VI",
      comunas: [
        "Rancagua",
        "Codegua",
        "Coinco",
        "Coltauco",
        "Doñihue",
        "Graneros",
        "Las Cabras",
        "Machalí",
        "Malloa",
        "Mostazal",
        "Olivar",
        "Peumo",
        "Pichidegua",
        "Quinta de Tilcoco",
        "Rengo",
        "Requínoa",
        "San Vicente",
        "Pichilemu",
        "La Estrella",
        "Litueche",
        "Marchihue",
        "Navidad",
        "Paredones",
        "San Fernando",
        "Chépica",
        "Chimbarongo",
        "Lolol",
        "Nancagua",
        "Palmilla",
        "Peralillo",
        "Placilla",
        "Pumanque",
        "Santa Cruz"
      ]
    },
    {
      id: 9,
      nombre: "Maule",
      numero: "VII",
      comunas: [
        "Talca",
        "Constitución",
        "Curepto",
        "Empedrado",
        "Maule",
        "Pelarco",
        "Pencahue",
        "Río Claro",
        "San Clemente",
        "San Rafael",
        "Cauquenes",
        "Chanco",
        "Pelluhue",
        "Curicó",
        "Hualañé",
        "Licantén",
        "Molina",
        "Rauco",
        "Romeral",
        "Sagrada Familia",
        "Teno",
        "Vichuquén",
        "Linares",
        "Colbún",
        "Longaví",
        "Parral",
        "Retiro",
        "San Javier",
        "Villa Alegre",
        "Yerbas Buenas"
      ]
    },
    {
      id: 10,
      nombre: "Ñuble",
      numero: "XVI",
      comunas: [
        "Chillán",
        "Bulnes",
        "Chillán Viejo",
        "El Carmen",
        "Pemuco",
        "Pinto",
        "Quillón",
        "San Ignacio",
        "Yungay",
        "Cobquecura",
        "Coelemu",
        "Ninhue",
        "Portezuelo",
        "Quirihue",
        "Ránquil",
        "Treguaco",
        "San Carlos",
        "Coihueco",
        "Ñiquén",
        "San Fabián",
        "San Nicolás"
      ]
    },
    {
      id: 11,
      nombre: "Biobío",
      numero: "VIII",
      comunas: [
        "Concepción",
        "Coronel",
        "Chiguayante",
        "Florida",
        "Hualpén",
        "Hualqui",
        "Lota",
        "Penco",
        "San Pedro de la Paz",
        "Santa Juana",
        "Talcahuano",
        "Tomé",
        "Los Ángeles",
        "Antuco",
        "Cabrero",
        "Laja",
        "Mulchén",
        "Nacimiento",
        "Negrete",
        "Quilaco",
        "Quilleco",
        "San Rosendo",
        "Santa Bárbara",
        "Tucapel",
        "Yumbel",
        "Alto Biobío"
      ]
    },
    {
      id: 12,
      nombre: "La Araucanía",
      numero: "IX",
      comunas: [
        "Temuco",
        "Carahue",
        "Cunco",
        "Curarrehue",
        "Freire",
        "Galvarino",
        "Gorbea",
        "Lautaro",
        "Loncoche",
        "Melipeuco",
        "Nueva Imperial",
        "Padre las Casas",
        "Perquenco",
        "Pitrufquén",
        "Pucón",
        "Saavedra",
        "Teodoro Schmidt",
        "Toltén",
        "Vilcún",
        "Villarrica",
        "Angol",
        "Collipulli",
        "Curacautín",
        "Ercilla",
        "Lonquimay",
        "Los Sauces",
        "Lumaco",
        "Purén",
        "Renaico",
        "Traiguén",
        "Victoria"
      ]
    },
    {
      id: 13,
      nombre: "Los Ríos",
      numero: "XIV",
      comunas: [
        "Valdivia",
        "Corral",
        "Lanco",
        "Los Lagos",
        "Máfil",
        "Mariquina",
        "Paillaco",
        "Panguipulli",
        "La Unión",
        "Futrono",
        "Lago Ranco",
        "Río Bueno"
      ]
    },
    {
      id: 14,
      nombre: "Los Lagos",
      numero: "X",
      comunas: [
        "Puerto Montt",
        "Calbuco",
        "Cochamó",
        "Fresia",
        "Frutillar",
        "Los Muermos",
        "Llanquihue",
        "Maullín",
        "Puerto Varas",
        "Castro",
        "Ancud",
        "Chonchi",
        "Curaco de Vélez",
        "Dalcahue",
        "Puqueldón",
        "Queilén",
        "Quellón",
        "Quemchi",
        "Quinchao",
        "Osorno",
        "Puerto Octay",
        "Purranque",
        "Puyehue",
        "Río Negro",
        "San Juan de la Costa",
        "San Pablo",
        "Chaitén",
        "Futaleufú",
        "Hualaihué",
        "Palena"
      ]
    },
    {
      id: 15,
      nombre: "Aysén del General Carlos Ibáñez del Campo",
      numero: "XI",
      comunas: [
        "Coihaique",
        "Lago Verde",
        "Aysén",
        "Cisnes",
        "Guaitecas",
        "Cochrane",
        "O'Higgins",
        "Tortel",
        "Chile Chico",
        "Río Ibáñez"
      ]
    },
    {
      id: 16,
      nombre: "Magallanes y de la Antártica Chilena",
      numero: "XII",
      comunas: [
        "Punta Arenas",
        "Laguna Blanca",
        "Río Verde",
        "San Gregorio",
        "Cabo de Hornos",
        "Antártica",
        "Porvenir",
        "Primavera",
        "Timaukel",
        "Natales",
        "Torres del Paine"
      ]
    }
  ];

  private regionSeleccionada: Region | null = null;
  private comunaSeleccionada: string | null = null;

  constructor(private firestore: Firestore) { }

    getRegiones(): Region[] {
    return this.regiones;
  }

  getComunas(): string[] {
    return this.regiones.flatMap(region => region.comunas);
  }

  getComunasPorRegion(regionId: number): string[] {
    const region = this.regiones.find(r => r.id === regionId);
    return region ? region.comunas : [];
  }

  buscarRegionPorNombre(nombre: string): Region | undefined {
    return this.regiones.find(region =>
      region.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
    );
  }

  buscarComunaPorNombre(nombre: string): { region: Region, comuna: string } | undefined {
    for (const region of this.regiones) {
      const comuna = region.comunas.find(c => 
        c.toLowerCase().includes(nombre.toLowerCase())
      );
      if (comuna) {
        return { region, comuna };
      }
    }
    return undefined;
  }

  setRegionSeleccionada(region: Region): void {
    this.regionSeleccionada = region;
    this.comunaSeleccionada = null; 
  }

  setComunaSeleccionada(comuna: string): void {
    this.comunaSeleccionada = comuna;
  }

  getRegionSeleccionada(): Region | null {
    return this.regionSeleccionada;
  }

  getComunaSeleccionada(): string | null {
    return this.comunaSeleccionada;
  }

  getRegionComunaActual(): {region: string, comuna: string} | null {
    if (this.regionSeleccionada && this.comunaSeleccionada) {
      return {
        region: this.regionSeleccionada.nombre,
        comuna: this.comunaSeleccionada
      };
    }
    return null;
  }

async obtenerDireccionesPorUsuario(usuarioId: string): Promise<any[]> {
  const ref = fsCollection(this.firestore, 'direcciones');
  const q = query(ref, where('usuario_id', '==', usuarioId));
  const querySnapshot = await getDocs(q);

  const direcciones = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      apellidos: data['apellidos'] || '',
      calle: data['calle'] || '',
      comuna: data['comuna'] || '',
      departamento: data['departamento'] || '',
      descripcion: data['descripcion'] || '',
      nombres: data['nombres'] || '',
      numero: data['numero']?.toString() || '',
      region: data['region'] || '',
      telefono: data['telefono'] || '',
      usuario_id: data['usuario_id'] || ''
    };
  });

  return direcciones;
}
}
