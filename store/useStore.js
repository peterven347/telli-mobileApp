import { create } from "zustand";

export const useUrl = create(() => ({
	url: "http://192.168.143.133:3030"
}))

export const useDomain = create((set) => (
    {
        // domains: [
		// 	{
		// 		"_id": "6795088edfbd1e8478a7c1ce",
		// 		"domain": "Independence Hall",
		// 		"creator": "Paul",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member",
		// 				"_id": "6795088edfbd1e8478a7c1cf"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member",
		// 				"_id": "6795088edfbd1e8478a7c1d0"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin",
		// 				"_id": "6795088edfbd1e8478a7c1d1"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "Department of chemistry",
		// 				"data": [
		// 					{
		// 						"resolved_votes": [],
		// 						"resolved": false,
        //                         "note": "The rich biodiversity of African herbal plants has historically been a cornerstone of traditional medicine on the continent. These plants hold immense therapeutic potential that has been relied upon for centuries even before the advent of modern medicine. However, their identification and classification often demand expert knowledge, limiting their accessibility to a wider audience. Despite its importance, traditional herbal knowledge's incorporation into contemporary medical care and scientific inquiry is constrained by its lack of organized documentation and recognition leading to being understudied. With advances in technology, especially artificial intelligence and machine learning, visual image recognition systems now offer the capability to automatically identify plants through images. Creating such a system for African herbal plants would not only preserve cultural heritage but also modernize its use by simplifying identification and increasing awareness of their medicinal applications",
		// 						"date_created": "2025-01-25T15:51:38.181Z",
		// 						"date_resolved": "2025-01-25T15:51:42.601Z",
		// 						"pictures": [
		// 							"picture",
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"_id": "6795088edfbd1e8478a7c1d3"
		// 					}
		// 				],
		// 				"_id": "6795088edfbd1e8478a7c1d2"
		// 			},
		// 			{
		// 				"title": "Faculty of science",
		// 				"data": [
		// 					{
		// 						"resolved_votes": [],
		// 						"resolved": false,
        //                         "note": "The rich biodiversity of African herbal plants has historically been a cornerstone of traditional medicine on the continent. These plants hold immense therapeutic potential that has been relied upon for centuries even before the advent of modern medicine. However, their identification and classification often demand expert knowledge, limiting their accessibility to a wider audience. Despite its importance, traditional herbal knowledge's incorporation into contemporary medical care and scientific inquiry is constrained by its lack of organized documentation and recognition leading to being understudied. With advances in technology, especially artificial intelligence and machine learning, visual image recognition systems now offer the capability to automatically identify plants through images. Creating such a system for African herbal plants would not only preserve cultural heritage but also modernize its use by simplifying identification and increasing awareness of their medicinal applications",
		// 						"date_created": "2025-01-25T15:51:38.181Z",
		// 						"pictures": [],
		// 						"_id": "6795088edfbd1e8478a7c1d5"
		// 					},
		// 					{
		// 						"resolved_votes": [],
		// 						"resolved": false,
        //                         "note": "The rich biodiversity of African herbal plants has historically been a cornerstone of traditional medicine on the continent. These plants hold immense therapeutic potential that has been relied upon for centuries even before the advent of modern medicine. However, their identification and classification often demand expert knowledge, limiting their accessibility to a wider audience. Despite its importance, traditional herbal knowledge's incorporation into contemporary medical care and scientific inquiry is constrained by its lack of organized documentation and recognition leading to being understudied. With advances in technology, especially artificial intelligence and machine learning, visual image recognition systems now offer the capability to automatically identify plants through images. Creating such a system for African herbal plants would not only preserve cultural heritage but also modernize its use by simplifying identification and increasing awareness of their medicinal applications",
		// 						"date_created": "2025-01-25T15:51:38.181Z",
		// 						"pictures": [],
		// 						"_id": "6795088edfbd1e8478a7c1d6"
		// 					}
		// 				],
		// 				"_id": "6795088edfbd1e8478a7c1d4"
		// 			}
		// 		],
		// 		"createdAt": "2025-01-25T15:51:42.618Z",
		// 		"updatedAt": "2025-01-25T15:51:42.618Z",
		// 		"__v": 0
		// 	},
		// 	{
		// 		"_id": "67954c8753172e822100bab8",
		// 		"domain": "University of Ibadan",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member",
		// 				"_id": "67954c8753172e822100bab9"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member",
		// 				"_id": "67954c8753172e822100baba"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin",
		// 				"_id": "67954c8753172e822100babb"
		// 			},
		// 			{
		// 				"name": "userid1df",
		// 				"role": "member",
		// 				"_id": "679584b60fd1f422a355b099"
		// 			},
		// 			{
		// 				"name": "use",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "useuyftk",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "useuk",
		// 				"role": "member"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-01-25T20:41:22.900Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [
		// 							"75rfxryd",
		// 							"75rfxryoiyfyjgyfjd",
		// 							"75peter"
		// 						],
		// 						"resolved": false,
		// 						"date_resolved": "2025-01-25T20:41:43.782Z",
		// 						"_id": "67954c8753172e822100babc"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "titttttle",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-01-25T20:41:22.900Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [
		// 							"67954c8753172e822100bab7",
		// 							"67954c8753172e822100bab4",
		// 							"67954c8753172e822100bab2",
		// 							"67954c8753172e822100bab9"
		// 						],
		// 						"resolved": false,
		// 						"_id": "67954c8753172e822100babd"
		// 					},
		// 					{
		// 						"date_created": "2025-01-25T20:41:22.900Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67954c8753172e822100babe"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-01-25T20:41:43.803Z",
		// 		"updatedAt": "2025-01-26T01:24:08.155Z",
		// 		"__v": 0
		// 	},
		// 	{
		// 		"_id": "67c0b5209cad31ea7db58b8f",
		// 		"domain": "University of Akureffffffffffffffffffffffffffffffffffffffffffffffffffff",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"date_resolved": "2025-02-27T18:55:28.258Z",
		// 						"_id": "67c0b5209cad31ea7db58b90"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b91"
		// 					},
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b92"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-02-27T18:55:28.289Z",
		// 		"updatedAt": "2025-02-27T18:55:28.289Z",
		// 		"__v": 0
		// 	},
		// 	{
		// 		"_id": "67c0b5209cad31ea7db58b8f",
		// 		"domain": "Nigeria",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"date_resolved": "2025-02-27T18:55:28.258Z",
		// 						"_id": "67c0b5209cad31ea7db58b90"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b91"
		// 					},
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b92"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-02-27T18:55:28.289Z",
		// 		"updatedAt": "2025-02-27T18:55:28.289Z",
		// 		"__v": 0
		// 	},
		// 	{
		// 		"_id": "67c0b5209cad31ea7db58b8f",
		// 		"domain": "Nigeria",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"date_resolved": "2025-02-27T18:55:28.258Z",
		// 						"_id": "67c0b5209cad31ea7db58b90"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b91"
		// 					},
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b92"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-02-27T18:55:28.289Z",
		// 		"updatedAt": "2025-02-27T18:55:28.289Z",
		// 		"__v": 0
		// 	},	
		// 	{
		// 		"_id": "67c0b5209cad31ea7db58b8f",
		// 		"domain": "Nigeria",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"date_resolved": "2025-02-27T18:55:28.258Z",
		// 						"_id": "67c0b5209cad31ea7db58b90"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b91"
		// 					},
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b92"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-02-27T18:55:28.289Z",
		// 		"updatedAt": "2025-02-27T18:55:28.289Z",
		// 		"__v": 0
		// 	},	
		// 	{
		// 		"_id": "67c0b5209cad31ea7db58b8f",
		// 		"domain": "Nigeria",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"date_resolved": "2025-02-27T18:55:28.258Z",
		// 						"_id": "67c0b5209cad31ea7db58b90"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b91"
		// 					},
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b92"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-02-27T18:55:28.289Z",
		// 		"updatedAt": "2025-02-27T18:55:28.289Z",
		// 		"__v": 0
		// 	},	
		// 	{
		// 		"_id": "67c0b5209cad31ea7db58b8f",
		// 		"domain": "Nigeria",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"date_resolved": "2025-02-27T18:55:28.258Z",
		// 						"_id": "67c0b5209cad31ea7db58b90"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b91"
		// 					},
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b92"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-02-27T18:55:28.289Z",
		// 		"updatedAt": "2025-02-27T18:55:28.289Z",
		// 		"__v": 0
		// 	},	
		// 	{
		// 		"_id": "67c0b5209cad31ea7db58b8f",
		// 		"domain": "Nigeria",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"date_resolved": "2025-02-27T18:55:28.258Z",
		// 						"_id": "67c0b5209cad31ea7db58b90"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b91"
		// 					},
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b92"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-02-27T18:55:28.289Z",
		// 		"updatedAt": "2025-02-27T18:55:28.289Z",
		// 		"__v": 0
		// 	},	
		// 	{
		// 		"_id": "67c0b5209cad31ea7db58b8f",
		// 		"domain": "Nigeria",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"date_resolved": "2025-02-27T18:55:28.258Z",
		// 						"_id": "67c0b5209cad31ea7db58b90"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b91"
		// 					},
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b92"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-02-27T18:55:28.289Z",
		// 		"updatedAt": "2025-02-27T18:55:28.289Z",
		// 		"__v": 0
		// 	},	
		// 	{
		// 		"_id": "67c0b5209cad31ea7db58b8f",
		// 		"domain": "Nigeria",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"date_resolved": "2025-02-27T18:55:28.258Z",
		// 						"_id": "67c0b5209cad31ea7db58b90"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b91"
		// 					},
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b92"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-02-27T18:55:28.289Z",
		// 		"updatedAt": "2025-02-27T18:55:28.289Z",
		// 		"__v": 0
		// 	},	
		// 	{
		// 		"_id": "67c0b5209cad31ea7db58b8f",
		// 		"domain": "Nigeria",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"date_resolved": "2025-02-27T18:55:28.258Z",
		// 						"_id": "67c0b5209cad31ea7db58b90"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b91"
		// 					},
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b92"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-02-27T18:55:28.289Z",
		// 		"updatedAt": "2025-02-27T18:55:28.289Z",
		// 		"__v": 0
		// 	},	
		// 	{
		// 		"_id": "67c0b5209cad31ea7db58b8f",
		// 		"domain": "Nigeria",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"date_resolved": "2025-02-27T18:55:28.258Z",
		// 						"_id": "67c0b5209cad31ea7db58b90"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "title",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b91"
		// 					},
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b92"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-02-27T18:55:28.289Z",
		// 		"updatedAt": "2025-02-27T18:55:28.289Z",
		// 		"__v": 0
		// 	},	
		// 	{
		// 		"_id": "67c0b5209cad31ea7db58b8f",
		// 		"domain": "last",
		// 		"creator": "Peterven",
		// 		"delegates": [
		// 			{
		// 				"name": "userid1",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid2",
		// 				"role": "member"
		// 			},
		// 			{
		// 				"name": "userid3",
		// 				"role": "admin"
		// 			}
		// 		],
		// 		"logo": "https://picsum.photos/200/300",
		// 		"public": true,
		// 		"sectors": [
		// 			{
		// 				"title": "title1",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [
		// 							"picture",
		// 							"pictur"
		// 						],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"date_resolved": "2025-02-27T18:55:28.258Z",
		// 						"_id": "67c0b5209cad31ea7db58b90"
		// 					}
		// 				]
		// 			},
		// 			{
		// 				"title": "title2",
		// 				"data": [
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b91"
		// 					},
		// 					{
		// 						"date_created": "2025-02-27T18:54:16.930Z",
		// 						"note": "note",
		// 						"pictures": [],
		// 						"resolved_votes": [],
		// 						"resolved": false,
		// 						"_id": "67c0b5209cad31ea7db58b92"
		// 					}
		// 				]
		// 			}
		// 		],
		// 		"createdAt": "2025-02-27T18:55:28.289Z",
		// 		"updatedAt": "2025-02-27T18:55:28.289Z",
		// 		"__v": 0
		// 	}
		// ],
        domains: [],
		currDomain: {},
		favourites: [],
        setDomains: (state) => set({ domains: state }),
        setCurrDomain: (state) => set({ currDomain: state }),
		setFavourites: (state) => set({ favourites: state })
    }
))

export const useModal = create((set) => ({
	modalVisible: false,
	setModalVisible: (state) => set({modalVisible: state})
}))

export const useDomainImg = create((set) => ({
	imageUri: {},
	setImageUri: (state) => set({imageUri: state})
}))

export const useToken = create((set) => ({
	accessToken: "",
	refreshToken: "",
	setAccessToken: (state) => set({ accessToken: state }),
	setRefreshToken: (state) => set({ refreshToken: state })
}))

export const useUser = create((set) => ({
	user: {},
	setUser: (state) => set({ user: state }),
}))

export const useSettings = create((set) => ({
	
}))