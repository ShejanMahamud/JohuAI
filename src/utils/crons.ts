import cron from 'node-cron';
import { OtpModel } from '../models/otp.model';
cron.schedule('0 0 * * *', async () => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const result = await OtpModel.deleteMany({
      expiresAt: { $lt: twentyFourHoursAgo },
    });
    console.log(`Deleted ${result.deletedCount} expired OTP records.`);
  } catch (error) {
    console.error('Error during OTP cleanup:', error);
  }
});
