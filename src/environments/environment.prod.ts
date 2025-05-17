export const environment = {
  production: true,
  firebase: {
    apiKey: "AIzaSyBiy0VDwgMrd8TC4xJ5OAD7ZWfPeGQODaA",
    authDomain: "base-de-datos-ptf.firebaseapp.com",
    projectId: "base-de-datos-ptf",
    storageBucket: "base-de-datos-ptf.firebasestorage.app",
    messagingSenderId: "861480881852",
    appId: "1:861480881852:web:7a415e3b9a84dd75e28ab9"
  },
  
  chilexpress: {
    envios: {
      primaryKey: 'b922d6f042114c3c9b250aecdc08e3a4',
      secondaryKey: 'a3f724258d89442586fe9bbcd882ee01'
    },
    cotizador: {
      primaryKey: '69197a11553f40c9a876e176f4ea709b',
      secondaryKey: '872847d96f5b4a1689cb2ce02eda613e'
    },
    coberturas: {
      primaryKey: '8147475cd5d64b6489858f566bc9864a',
      secondaryKey: '6f6805b600974c319cdd90558fa7ea3b'
    },
    urls: {
      cotizador: 'http://testservices.wschilexpress.com/rating',
      coberturas: 'http://testservices.wschilexpress.com/georeference',
      envios: 'http://testservices.wschilexpress.com/transport-orders'
    }
  }
}