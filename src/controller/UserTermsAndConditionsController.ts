import { Authorized, Body, Get, HeaderParam, JsonController, Post, Res } from 'routing-controllers';
import { User } from '../models/User';
import { UserTcBatchAcknowledgeDto } from './dto/UserTcBatchAcknowledgeDto';
import { BaseController } from './BaseController';
import { Response } from 'express';

@JsonController('/api/terms-and-conditions')
@Authorized()
export class UserTermsAndConditionsController extends BaseController {
  @Get()
  async index(@HeaderParam('authorization') user: User, @Res() response: Response) {
    const userTCAcknowledgement = await this.termsAndConditionsAcknowledgementService.getAcknowledgementListForUser(
      user,
    );
    return response.status(200).send({ userTCAcknowledgement });
  }

  @Post('/')
  async batchAcknowledge(
    @Body() body: UserTcBatchAcknowledgeDto,
    @HeaderParam('authorization') user: User,
    @Res() response: Response,
  ) {
    const organization = await this.organisationService.findById(body.organisationId);
    await this.termsAndConditionsAcknowledgementService.saveUserAcknowledge(user, organization);
    const userTCAcknowledgement = await this.termsAndConditionsAcknowledgementService.getAcknowledgementListForUser(
      user,
    );
    return response.status(200).send({ userTCAcknowledgement });
  }
}
