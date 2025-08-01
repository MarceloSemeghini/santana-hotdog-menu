<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInita6bffe669ce27ab087e3d2293cd311a9
{
    public static $prefixLengthsPsr4 = array (
        'M' => 
        array (
            'Marcelo\\SantanaHotdogMenu\\' => 26,
        ),
        'F' => 
        array (
            'Firebase\\JWT\\' => 13,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'Marcelo\\SantanaHotdogMenu\\' => 
        array (
            0 => __DIR__ . '/../..' . '/src',
        ),
        'Firebase\\JWT\\' => 
        array (
            0 => __DIR__ . '/..' . '/firebase/php-jwt/src',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInita6bffe669ce27ab087e3d2293cd311a9::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInita6bffe669ce27ab087e3d2293cd311a9::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInita6bffe669ce27ab087e3d2293cd311a9::$classMap;

        }, null, ClassLoader::class);
    }
}
