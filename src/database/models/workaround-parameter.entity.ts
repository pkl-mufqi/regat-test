import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class WorkaroundParameter extends Model<WorkaroundParameter> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  })
  workaroundParameterId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  key: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  value: string;
}
