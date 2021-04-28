import { Authorized, Body, Get, JsonController, Param, Post } from 'routing-controllers';
import { BaseController } from './BaseController';
import { TCUserAcknowledgement } from '../models/TCUserAcknowledgement';

@JsonController('/organisations/:organisationId/terms-and-conditions')
@Authorized('web_users')
export class TermsAndConditionsController extends BaseController {
  @Get()
  async index(@Param('organisationId') organisationId: number): Promise<TCUserAcknowledgement[]> {
    return this.termsAndConditionsAcknowledgementService.findByOrganisationId(organisationId);
  }

  @Post()
  async createOne(
    @Param('organisationId') organisationId: number,
    @Body() body: TCUserAcknowledgement,
  ): Promise<TCUserAcknowledgement> {
    return this.termsAndConditionsAcknowledgementService.createForOrganisation(
      organisationId,
      body,
    );
  }
}
