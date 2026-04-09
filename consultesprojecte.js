//1
db.visualitzacions.aggregate([
    {$group: { _id: "$video_id", total: {$sum: 1}}},
    {$lookup: {
           from: "videos",
           localField: "_id",
           foreignField: "_id",
           as: "video"
         }},
    {$unwind: "$video"},
    {$project: {"_id":0, "video.titol":1, "video.descripcio":1, "total":1}},
    {$sort: {"total":-1}}
    ])


//2
db.valoracions.aggregate([
    {$group: { _id: "$video_id", mitjana: {$avg: "$puntuacio"}}},
    {$lookup: {
           from: "videos",
           localField: "_id",
           foreignField: "_id",
           as: "video"
         }},
    {$unwind: "$video"},
    {$project: {"_id":0, "video.titol":1, "video.descripcio":1, "mitjana":1}},
    {$sort: {"mitjana":1}}
    ])


//3
db.videos.aggregate([
  {$match: {_id: "VID_001"}},
  {
    $lookup: {
      from: "usuaris",
      localField: "creador.niu_dni",
      foreignField: "_dni",
      as: "usuari"
    }},
  {$unwind: "$usuari"},
  {
    $lookup: {
      from: "valoracions",
      localField: "_id",
      foreignField: "video_id",
      as: "valoracions"
    }},
  {
    $lookup: {
      from: "videos",
      localField: "_id",
      foreignField: "id_problema_resolt",
      as: "respostes"
    }},
  {$unwind: "$valoracions"},
  {
    $group: {
      _id: "$_id",
      video: { $first: "$$ROOT" },
      puntuacio_mitjana: { $avg: "$valoracions.puntuacio" },
      nombre_comentaris: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      titol: "$video.titol",
      descripcio: "$video.descripcio",
      usuari: "$video.usuari",
      puntuacio_mitjana: 1,
      nombre_comentaris: 1,
      nombre_videos_resposta: { $size: "$video.respostes" }
    }
  }
])



//4
db.videos.aggregate([
  { $match: { tipus: "Problema" } },
  {
    $facet: {
      per_professor: [
        {
          $group: {
            _id: "$creador.niu_dni",
            nom_professor: { $first: "$creador.nom" },
            total_problemes: { $sum: 1 }
          }
        },
        { $sort: { total_problemes: -1 } },
        {
          $project: {
            _id: 0,
            nom_professor: 1,
            total_problemes: 1
          }
        }
      ],
      per_assignatura: [
        {
          $group: {
            _id: "$assignatura.id",
            nom_assignatura: { $first: "$assignatura.nom" },
            total_problemes: { $sum: 1 }
          }
        },
        { $sort: { total_problemes: -1 } },
        {
          $project: {
            _id: 0,
            nom_assignatura: 1,
            total_problemes: 1
          }
        }
      ]
    }
  }
])


//5
db.valoracions.aggregate([
  {
    $lookup: {
      from: "usuaris",
      localField: "usuari_id",
      foreignField: "_dni",
      as: "usuari"
    }},
  {$unwind: "$usuari"},
  {$match: {"usuari.tipus": "Estudiant"}},
  {
    $group: {
      _id: "$usuari_id",
      total_comentaris: { $sum: 1 }
    }},
  {
    $project: {
      _id: 0,
      dni: "$_id",
      total_comentaris: 1
    }
  }
]).sort({total_comentaris:-1}).limit(1)


//6
db.valoracions.aggregate([
  { $match: { video_id: "VID_001" } },
  { $sort: { data: 1 } },
  {
    $lookup: {
      from: "videos",
      localField: "video_id",
      foreignField: "_id",
      as: "video"
    }
  },
  { $unwind: "$video" },
  {
    $lookup: {
      from: "usuaris",
      localField: "video.creador.niu_dni",
      foreignField: "_dni",
      as: "creador_video"
    }},
  { $unwind: "$creador_video" },
  {
    $lookup: {
      from: "usuaris",
      localField: "usuari_id",
      foreignField: "_dni",
      as: "usuari_comentari"
    }},
  { $unwind: "$usuari_comentari" },
  {
    $project: {
      _id: 0,
      video: {
        titol: "$video.titol",
        descripcio: "$video.descripcio",
        tipus: "$video.tipus",
        assignatura: "$video.assignatura"
      },
      creador_video: {
        dni: "$creador_video._dni",
        nom: "$creador_video.nom",
        correu: "$creador_video.correu",
        tipus: "$creador_video.tipus",
        especialitat: "$creador_video.especialitat"
      },
      comentari: {
        data: "$data",
        puntuacio: "$puntuacio",
        text: "$comentari"
      },
      usuari_comentari: {
        dni: "$usuari_comentari._dni",
        nom: "$usuari_comentari.nom",
        tipus: "$usuari_comentari.tipus"
      }
    }}])


//7
db.usuaris.aggregate([
  { $match: { tipus: "Estudiant" } },
  {
    $lookup: {
      from: "videos",
      localField: "_dni",
      foreignField: "creador.niu_dni",
      as: "videos_pujats"
    }
  },
  { $match: { videos_pujats: { $size: 0 } } },
  {
    $project: {
      _id: 0,
      dni: "$_dni",
      nom: 1,
      correu: 1,
      pais: 1,
      curs: 1
    }
  }
])