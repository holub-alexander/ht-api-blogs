import { usersCollection } from "../../adapters/mongoDB";
import { usersQueryRepository } from "./users.query.repository";
import { ObjectId, WithId } from "mongodb";
import { UserAccountDBType } from "../../../@types";
import { NewPasswordRecoveryInputModel } from "../../../service-layer/request/requestTypes";

export const usersWriteRepository = {
  createUser: async (data: UserAccountDBType): Promise<WithId<UserAccountDBType> | null> => {
    const res = await usersCollection.insertOne(data, {});

    if (res.acknowledged) {
      return usersQueryRepository.getUserById<UserAccountDBType>(res.insertedId.toString());
    }

    return null;
  },

  userConfirmRegistration: async (_id: ObjectId): Promise<boolean> => {
    const res = await usersCollection.updateOne({ _id }, { $set: { "emailConfirmation.isConfirmed": true } });
    return res.modifiedCount === 1;
  },

  updateConfirmationCode: async (
    _id: ObjectId,
    { confirmationCode, expirationDate }: { confirmationCode: string; expirationDate: Date }
  ): Promise<boolean> => {
    const res = await usersCollection.updateOne(
      { _id },
      {
        $set: {
          "emailConfirmation.confirmationCode": confirmationCode,
          "emailConfirmation.expirationDate": expirationDate,
        },
      }
    );

    return res.modifiedCount === 1;
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    const isValidId = ObjectId.isValid(userId);

    if (isValidId) {
      const res = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
      return res.deletedCount > 0;
    }

    return false;
  },

  deleteAllUsers: async (): Promise<boolean> => {
    const res = await usersCollection.deleteMany({});
    return res.deletedCount > 0;
  },

  addPasswordRecoveryData: async (userId: ObjectId, recoveryCode: string): Promise<boolean> => {
    const res = await usersCollection.updateOne(
      { _id: userId },
      {
        $set: {
          "passwordRecovery.recoveryCode": recoveryCode,
        },
      }
    );

    return res.modifiedCount === 1;
  },

  confirmPasswordRecovery: async ({ recoveryCode, passwordHash }: { passwordHash: string; recoveryCode: string }) => {
    const res = await usersCollection.updateOne(
      { "passwordRecovery.recoveryCode": recoveryCode },
      { $set: { "passwordRecovery.recoveryCode": null, "accountData.password": passwordHash } }
    );

    return res.modifiedCount === 1;
  },
};
