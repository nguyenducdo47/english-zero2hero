<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: 'English Zero2Hero API',
    version: '1.0.0',
    description: 'REST API v1 for grammar, exams, AI grading, mobile clients.'
)]
#[OA\Server(url: 'http://localhost:8000', description: 'Local')]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'Sanctum token'
)]
class ApiDocumentation {}
