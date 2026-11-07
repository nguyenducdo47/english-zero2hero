<?php

namespace App;

/**
 * @OA\Info(
 *     title="English Zero2Hero API",
 *     version="1.0.0",
 *     description="REST API for grammar, exams, AI grading, and mobile app integration."
 * )
 *
 * @OA\Server(url=L5_SWAGGER_CONST_HOST, description="API server")
 *
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="Sanctum token"
 * )
 */
class OpenApi {}
