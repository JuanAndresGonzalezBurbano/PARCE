<?php

namespace App\Core;

/**
 * Clase base para los modelos de datos
 *
 * Provee operaciones comunes de base de datos para todos los modelos.
 * Implementa el patrón Active Record con soporte de constructor de consultas.
 */
abstract class Model
{
    protected string $table;
    protected string $primaryKey = 'id';
    protected array $fillable = [];
    protected array $hidden = [];
    protected array $attributes = [];

    /**
     * Busca un registro por su ID y lo retorna como instancia del modelo
     */
    public static function find(int $id): ?static
    {
        $instance = new static();
        $sql = "SELECT * FROM {$instance->table} WHERE {$instance->primaryKey} = ? LIMIT 1";
        $result = Database::fetchOne($sql, [$id]);

        if ($result) {
            $instance->attributes = $result;
            return $instance;
        }

        return null;
    }

    /**
     * Retorna todos los registros de la tabla como arreglo de instancias del modelo
     */
    public static function all(): array
    {
        $instance = new static();
        $sql = "SELECT * FROM {$instance->table}";
        $results = Database::fetchAll($sql);

        return array_map(function($row) {
            $model = new static();
            $model->attributes = $row;
            return $model;
        }, $results);
    }

    /**
     * Busca registros que coincidan con una condición de igualdad en una columna
     */
    public static function where(string $column, mixed $value): array
    {
        $instance = new static();
        $sql = "SELECT * FROM {$instance->table} WHERE {$column} = ?";
        $results = Database::fetchAll($sql, [$value]);

        return array_map(function($row) {
            $model = new static();
            $model->attributes = $row;
            return $model;
        }, $results);
    }

    /**
     * Retorna el primer registro que coincida con la condición indicada
     */
    public static function firstWhere(string $column, mixed $value): ?static
    {
        $instance = new static();
        $sql = "SELECT * FROM {$instance->table} WHERE {$column} = ? LIMIT 1";
        $result = Database::fetchOne($sql, [$value]);

        if ($result) {
            $instance->attributes = $result;
            return $instance;
        }

        return null;
    }


    /**
     * Crea un nuevo registro con los datos proporcionados y retorna la instancia creada
     */
    public static function create(array $data): static
    {
        $instance = new static();
        $fillable = array_intersect_key($data, array_flip($instance->fillable));

        $id = Database::insert($instance->table, $fillable);

        return static::find($id);
    }

    /**
     * Guarda el estado actual del modelo (inserta o actualiza según corresponda)
     */
    public function save(): bool
    {
        $data = array_intersect_key($this->attributes, array_flip($this->fillable));

        if (isset($this->attributes[$this->primaryKey])) {
            // Actualizar registro existente
            $id = $this->attributes[$this->primaryKey];
            $rowCount = Database::update(
                $this->table,
                $data,
                "{$this->primaryKey} = ?",
                [$id]
            );
            return $rowCount > 0;
        } else {
            // Insertar nuevo registro
            $id = Database::insert($this->table, $data);
            $this->attributes[$this->primaryKey] = $id;
            return true;
        }
    }

    /**
     * Elimina el registro actual de la base de datos
     */
    public function delete(): bool
    {
        if (!isset($this->attributes[$this->primaryKey])) {
            return false;
        }

        $id = $this->attributes[$this->primaryKey];
        $rowCount = Database::delete(
            $this->table,
            "{$this->primaryKey} = ?",
            [$id]
        );

        return $rowCount > 0;
    }

    /**
     * Obtiene el valor de un atributo dinámicamente
     */
    public function __get(string $name): mixed
    {
        return $this->attributes[$name] ?? null;
    }

    /**
     * Asigna el valor de un atributo dinámicamente
     */
    public function __set(string $name, mixed $value): void
    {
        $this->attributes[$name] = $value;
    }

    /**
     * Verifica si un atributo existe en el modelo
     */
    public function __isset(string $name): bool
    {
        return isset($this->attributes[$name]);
    }

    /**
     * Convierte el modelo a un arreglo, excluyendo los atributos ocultos
     */
    public function toArray(): array
    {
        $data = $this->attributes;

        // Eliminar atributos marcados como ocultos
        foreach ($this->hidden as $key) {
            unset($data[$key]);
        }

        return $data;
    }

    /**
     * Convierte el modelo a una cadena JSON
     */
    public function toJson(): string
    {
        return json_encode($this->toArray());
    }
}
