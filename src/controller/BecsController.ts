import {Authorized, Body, Delete, Get, HeaderParam, JsonController, Param, Post, QueryParam, Res} from 'routing-controllers';
import {BaseController} from "./BaseController";
import {Response} from "express";
import Stripe from 'stripe';
import { User } from '../models/User';
import { Organisation } from 'src/models/Organisation';
import { logger } from '../logger';
import AppConstants from 'src/constants/AppConstants';


@JsonController('/becs')
export class UserRoleEntityController extends BaseController {
    private stripe;
    constructor() {
        super()
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {apiVersion: '2020-08-27'});
    }

    @Authorized()
    @Get('/secret/:orgId')
    async getSecret(
        @HeaderParam("authorization") currentUser: User,
        @Param("orgId") orgId: number
    ): Promise<unknown> {
        let orgProfile: Organisation = await this.organisationService.findById(orgId);
        let stripeCustomerId;
        if (orgProfile.stripeBecsMandateId) {
            throw new Error('Already attached BECS account')
        }
        if (!orgProfile.stripeCustomerAccountId) {
            const customer = await this.stripe.customers.create({
                name: orgProfile.name,
                email: orgProfile.email,
            }) 
            await this.organisationService.addStripeCustomerId(currentUser.id, customer.id)
            stripeCustomerId = customer.id
        } else {
            stripeCustomerId = orgProfile.stripeCustomerAccountId
        }
        const setupIntent =  await this.stripe.setupIntents.create({
            customer: stripeCustomerId,
            payment_method_types: ["au_becs_debit"],
        });
        return setupIntent.client_secret;
    }

    @Authorized()
    @Get('/confirm')
    async confirmBecsSetup(
        @HeaderParam("authorization") currentUser: User,
    ): Promise<unknown> {
        let orgProfile: Organisation = await this.organisationService.findById(currentUser.id);
        let stripeCustomerId;
        if (!orgProfile.stripeCustomerAccountId) {
            throw new Error('Stripe account not found')
        } else {
            stripeCustomerId = orgProfile.stripeCustomerAccountId;
        }
        const paymentMethods = await this.stripe.paymentMethods.list({
            customer: stripeCustomerId,
            type: 'au_becs_debit'
        });
        if (paymentMethods.data && paymentMethods.data.length) {
            await this.organisationService.addBecsId(currentUser.id, paymentMethods.data[0].id)
        } else {
            throw new Error('No BECS account found')
        }        
        return 'Account confirmed successfully'
    }
}
