<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/me', function (Request $request) {
    return response()->json([
        'data' => $request->user()->only([
            'id',
            'name',
            'username',
            'email',
        ]),
    ]);
})->middleware('auth:sanctum');
