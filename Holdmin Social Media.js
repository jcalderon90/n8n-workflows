{
    "nodes": [
        {
            "parameters": {
                "rule": {
                    "interval": [
                        {}
                    ]
                }
            },
            "type": "n8n-nodes-base.scheduleTrigger",
            "typeVersion": 1.3,
            "position": [
                -704,
                480
            ],
            "id": "471dac33-4cc0-4a75-891a-5410aa312d58",
            "name": "Schedule Trigger"
        },
        {
            "parameters": {
                "options": {}
            },
            "type": "@n8n/n8n-nodes-langchain.embeddingsOpenAi",
            "typeVersion": 1.2,
            "position": [
                -272,
                912
            ],
            "id": "75236b05-61e3-48d9-9abf-dd9a89be4beb",
            "name": "Embeddings OpenAI",
            "credentials": {
                "openAiApi": {
                    "id": "LtzIKoi61tZvaeua",
                    "name": "Vectorizer Agent - Knowledge Bases"
                }
            }
        },
        {
            "parameters": {
                "mode": "retrieve-as-tool",
                "toolDescription": "Toma esta base de conocimientos como referencia y base absoluta para el contexto",
                "mongoCollection": {
                    "__rl": true,
                    "value": "documents",
                    "mode": "list",
                    "cachedResultName": "documents"
                },
                "embedding": "holdmin_embedding",
                "vectorIndexName": "holdmin_vector_index",
                "options": {}
            },
            "type": "@n8n/n8n-nodes-langchain.vectorStoreMongoDBAtlas",
            "typeVersion": 1.3,
            "position": [
                -352,
                704
            ],
            "id": "07db9b83-e153-4d78-9746-934afae1e28c",
            "name": "base_conocimientos",
            "credentials": {
                "mongoDb": {
                    "id": "oJIk7nwRjGOr9zxy",
                    "name": "Holdmin"
                }
            }
        },
        {
            "parameters": {
                "model": "sonar-pro",
                "messages": {
                    "message": [
                        {
                            "content": "={{ $fromAI('message', '', 'string') }}"
                        }
                    ]
                },
                "options": {},
                "requestOptions": {}
            },
            "type": "n8n-nodes-base.perplexityTool",
            "typeVersion": 1,
            "position": [
                -64,
                704
            ],
            "id": "c99d9999-7c4e-4259-a4d9-c2fa7bd0d725",
            "name": "busca_web",
            "credentials": {
                "perplexityApi": {
                    "id": "vjfRok6qwbep4djO",
                    "name": "Perplexity account"
                }
            }
        },
        {
            "parameters": {
                "promptType": "define",
                "text": "Investiga en la base de conocimientos y en la web sobre tendencias actuales de IA y estrategia para generar 20 ideas de posts de alta autoridad. No te limites a un solo tema; busca una mezcla de noticias de febrero 2026, consejos estratégicos y ADN de RedTec.",
                "options": {
                    "systemMessage": "=Eres el Agente de Estrategia de RedTec. Tienes prohibido responder por cuenta propia sin investigar primero.\n\nPROTOCOLO OBLIGATORIO DE TRES PASOS:\n1. PASO 1 (Interno): Investiga en 'base_conocimientos' para entender el enfoque de RedTec.\n2. PASO 2 (Externo): Llama a 'busca_web' para obtener tendencias de este mes (febrero 2026).\n3. PASO 3 (Salida): Basado en lo anterior, genera 20 posts diferentes.\n\nESTRUCTURA DE SALIDA (JSON ÚNICAMENTE):\nDevuelve exclusivamente un ARRAY de 20 objetos con este formato:\n[\n  {\n    \"post_number\": \"1\",\n    \"title\": \"Título\",\n    \"objective\": \"Objetivo\",\n    \"ideal_social_network\": \"LinkedIn\",\n    \"target_audience\": \"Audiencia\",\n    \"visual_creative_idea\": {\n      \"concept\": \"Concepto\",\n      \"left_side\": { \"description\": \"Lado A\", \"elements\": [] },\n      \"right_side\": { \"description\": \"Lado B\" }\n    },\n    \"caption\": \"Cuerpo del post... #AI #RedTec\"\n  }, ... hasta el 20\n]",
                    "maxIterations": 20
                }
            },
            "type": "@n8n/n8n-nodes-langchain.agent",
            "typeVersion": 3.1,
            "position": [
                -344,
                480
            ],
            "id": "2acafa7f-6ae1-40f5-af4b-a265fe65265d",
            "name": "AI Agent"
        },
        {
            "parameters": {
                "model": {
                    "__rl": true,
                    "value": "gpt-4o-mini",
                    "mode": "list",
                    "cachedResultName": "gpt-4o-mini"
                },
                "builtInTools": {},
                "options": {}
            },
            "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
            "typeVersion": 1.3,
            "position": [
                -480,
                704
            ],
            "id": "97df4fd0-b184-49cf-9ef6-ff494c4d6a42",
            "name": "OpenAI Chat Model",
            "credentials": {
                "openAiApi": {
                    "id": "N77GbsiuskkMfcXm",
                    "name": "Holdmin"
                }
            }
        },
        {
            "parameters": {
                "jsCode": "// Obtenemos el output del agente\nconst rawOutput = $input.first().json.output;\n\n// Buscamos algo que parezca un array [...] o un objeto {...}\nconst jsonMatch = rawOutput.match(/\\[[\\s\\S]*\\]|\\{[\\s\\S]*\\}/);\n\nif (jsonMatch) {\n  try {\n    const parsedData = JSON.parse(jsonMatch[0]);\n    \n    // Si es un array, lo devolvemos como items separados para n8n\n    if (Array.isArray(parsedData)) {\n      return parsedData.map(item => ({ json: item }));\n    } \n    // Si el agente envolvió el array en un objeto (ej: { \"posts\": [...] })\n    else if (parsedData.posts && Array.isArray(parsedData.posts)) {\n      return parsedData.posts.map(item => ({ json: item }));\n    }\n    // Si solo devolvió uno por error, lo devolvemos igual\n    else {\n      return [{ json: parsedData }];\n    }\n    \n  } catch (error) {\n    return [{ json: { error: \"Error de parseo\", original: rawOutput } }];\n  }\n} else {\n  return [{ json: { error: \"No se encontró JSON\", original: rawOutput } }];\n}"
            },
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [
                144,
                480
            ],
            "id": "b70962c6-5a2a-4bfa-8b87-4cb4a5693646",
            "name": "PARSE RESPONSE"
        }
    ],
        "connections": {
        "Schedule Trigger": {
            "main": [
                [
                    {
                        "node": "AI Agent",
                        "type": "main",
                        "index": 0
                    }
                ]
            ];
        },
        "Embeddings OpenAI": {
            "ai_embedding": [
                [
                    {
                        "node": "base_conocimientos",
                        "type": "ai_embedding",
                        "index": 0
                    }
                ]
            ];
        },
        "base_conocimientos": {
            "ai_tool": [
                [
                    {
                        "node": "AI Agent",
                        "type": "ai_tool",
                        "index": 0
                    }
                ]
            ];
        },
        "busca_web": {
            "ai_tool": [
                [
                    {
                        "node": "AI Agent",
                        "type": "ai_tool",
                        "index": 0
                    }
                ]
            ];
        },
        "AI Agent": {
            "main": [
                [
                    {
                        "node": "PARSE RESPONSE",
                        "type": "main",
                        "index": 0
                    }
                ]
            ];
        },
        "OpenAI Chat Model": {
            "ai_languageModel": [
                [
                    {
                        "node": "AI Agent",
                        "type": "ai_languageModel",
                        "index": 0
                    }
                ]
            ];
        },
        "PARSE RESPONSE": {
            "main": [
                []
            ];
        }
    },
    "pinData": { },
    "meta": {
        "templateCredsSetupCompleted": true,
            "instanceId": "d4ab02fb1ef8b6ca2c1c5c1f280ee696b0514d7d92cee5fb0da1784dbe393998";
    }
}