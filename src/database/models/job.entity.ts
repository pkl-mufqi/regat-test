import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class Job extends Model<Job> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
  })
  lastJobId: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  alertId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  actionName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  type: string;
}
