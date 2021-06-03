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
    const result = await this.getUserTCAcknowledgement(user);
    return response.status(200).send({ userTCAcknowledgement: [...result] });
  }

  @Post('/')
  async batchAcknowledge(
    @Body() body: UserTcBatchAcknowledgeDto,
    @HeaderParam('authorization') user: User,
    @Res() response: Response,
  ) {
    const organization = await this.organisationService.findById(body.organisationId);
    await this.termsAndConditionsAcknowledgementService.saveUserAcknowledge(user, organization);
    const result = await this.getUserTCAcknowledgement(user);
    return response.status(200).send({ userTCAcknowledgement: [...result] });
  }

  async getUserTCAcknowledgement(user) {
    const userTCAcknowledgement = await this.termsAndConditionsAcknowledgementService.getAcknowledgementListForUser(
      user,
    );
    if (!userTCAcknowledgement.length) {
      return [];
    }
    const organisationFirstLevelList = await this.organisationService.getAffiliatedOrganisations(
      userTCAcknowledgement,
      3,
    );

    const organisationSecondLevel = await this.organisationService.getAffiliatedOrganisations(
      userTCAcknowledgement,
      4,
    );
    return new Set([
      ...userTCAcknowledgement,
      ...organisationFirstLevelList,
      ...organisationSecondLevel,
    ]);
  }
}
