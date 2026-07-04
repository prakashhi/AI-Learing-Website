import { Model, ModelStatic, WhereOptions, FindOptions, CreateOptions, UpdateOptions, DestroyOptions } from "sequelize";

export class BaseRepository<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findByPk(id);
  }

  async findAll(options?: FindOptions<T>): Promise<T[]> {
    return this.model.findAll(options);
  }

  async findOne(options: FindOptions<T>): Promise<T | null> {
    return this.model.findOne(options);
  }

  async create(data: Partial<T>, options?: CreateOptions): Promise<T> {
    return this.model.create(data as any, options);
  }

  async update(data: Partial<T>, options: UpdateOptions): Promise<[number, T[]]> {
    return this.model.update(data, options);
  }

  async destroy(options: DestroyOptions): Promise<number> {
    return this.model.destroy(options);
  }

  async count(options?: FindOptions<T>): Promise<number> {
    return this.model.count(options);
  }
}
