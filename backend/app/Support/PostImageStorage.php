<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Throwable;

class PostImageStorage
{
    private const DIRECTORY = 'post-images';

    public function store(UploadedFile $image): string
    {
        return $image->store(self::DIRECTORY, 'public');
    }

    public function url(?string $path): ?string
    {
        if (! $this->isManagedPath($path)) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    public function delete(?string $path): bool
    {
        if (! $this->isManagedPath($path)) {
            return false;
        }

        try {
            return Storage::disk('public')->delete($path);
        } catch (Throwable) {
            return false;
        }
    }

    private function isManagedPath(?string $path): bool
    {
        if (! is_string($path) || $path === '') {
            return false;
        }

        return str_starts_with($path, self::DIRECTORY.'/')
            && ! str_starts_with($path, '/')
            && ! str_contains($path, '..');
    }
}
