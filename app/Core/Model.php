<?php

namespace App\Core;

/**
 * Base Model Class
 * 
 * Provides common database operations for models.
 * Implements Active Record pattern with query builder support.
 */
abstract class Model
{
    protected string $table;
    protected string $primaryKey = 'id';
    protected array $fillable = [];
    protected array $hidden = [];
    protected array $attributes = [];

    /**
     * Find record by ID
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
     * Find all records
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
     * Find records by condition
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
     * Find first record by condition
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
     * Create new record
     */
    public static function create(array $data): static
    {
        $instance = new static();
        $fillable = array_intersect_key($data, array_flip($instance->fillable));
        
        $id = Database::insert($instance->table, $fillable);
        
        return static::find($id);
    }

    /**
     * Save current model
     */
    public function save(): bool
    {
        $data = array_intersect_key($this->attributes, array_flip($this->fillable));
        
        if (isset($this->attributes[$this->primaryKey])) {
            // Update existing record
            $id = $this->attributes[$this->primaryKey];
            $rowCount = Database::update(
                $this->table,
                $data,
                "{$this->primaryKey} = ?",
                [$id]
            );
            return $rowCount > 0;
        } else {
            // Insert new record
            $id = Database::insert($this->table, $data);
            $this->attributes[$this->primaryKey] = $id;
            return true;
        }
    }

    /**
     * Delete current model
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
     * Get attribute value
     */
    public function __get(string $name): mixed
    {
        return $this->attributes[$name] ?? null;
    }

    /**
     * Set attribute value
     */
    public function __set(string $name, mixed $value): void
    {
        $this->attributes[$name] = $value;
    }

    /**
     * Check if attribute exists
     */
    public function __isset(string $name): bool
    {
        return isset($this->attributes[$name]);
    }

    /**
     * Convert model to array
     */
    public function toArray(): array
    {
        $data = $this->attributes;
        
        // Remove hidden attributes
        foreach ($this->hidden as $key) {
            unset($data[$key]);
        }
        
        return $data;
    }

    /**
     * Convert model to JSON
     */
    public function toJson(): string
    {
        return json_encode($this->toArray());
    }
}
