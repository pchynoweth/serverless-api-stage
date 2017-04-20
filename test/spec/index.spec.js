'use strict';

const ApiStagePlugin = require('../../src/index');

const expect = require('chai').expect;
const sinon = require('sinon');
const mockServerless = require('../mock/serverless');

describe('The `serverless-api-stage` plugin', function () {
    it('Exports a constructor function', function () {
        expect(ApiStagePlugin).to.be.a('function');
    });
    describe('The constructed object', function () {
        let pluginInstance;
        beforeEach(function () {
            pluginInstance = new ApiStagePlugin();
        });
        it('Exposes a `before:deploy:deploy` hook', function () {
            expect(pluginInstance.hooks).to.be.an('object');
            expect(pluginInstance.hooks['before:deploy:deploy']).to.be.a('function');
        });
    });
    describe('With no `stageSettings` custom property', function () {
        let serverless, pluginInstance;
        beforeEach(function () {
            serverless = mockServerless('service', 'testing', 'Deployment');
            pluginInstance = new ApiStagePlugin(serverless);
        });
        describe('When the `before:deploy:deploy` hook is executed', function () {
            beforeEach(function () {
                pluginInstance.hooks['before:deploy:deploy']();
            });
            it('Adds a stage resource to the CloudFormation template with no variables and default settings', function () {
                expect(serverless.service.provider.compiledCloudFormationTemplate.Resources.ApiGatewayStageTesting).to.deep.equal({
                    Type: 'AWS::ApiGateway::Stage',
                    Properties: {
                        StageName: 'testing',
                        Description: 'testing stage of service',
                        RestApiId: {
                            Ref: 'ApiGatewayRestApi'
                        },
                        DeploymentId: {
                            Ref: 'Deployment'
                        },
                        Variables: {},
                        MethodSettings: [
                            {
                                DataTraceEnabled: true,
                                HttpMethod: '*',
                                ResourcePath: '/*',
                                MetricsEnabled: false
                            }
                        ]
                    }
                });
            });
            it('Removes the `StageName` property of the deployment resource', function () {
                expect(serverless.service.provider.compiledCloudFormationTemplate.Resources.Deployment.Properties.StageName).to.equal(undefined);
            });
            it('Logs messages', function () {
                expect(serverless.cli.log.calledTwice).to.equal(true);
            });
        });
    });
    describe('With a `stageSettings` custom property that specifies `Variables` and `StageSettings`', function () {
        let serverless, pluginInstance;
        beforeEach(function () {
            serverless = mockServerless('service', 'testing', 'Deployment', {
                Variables: {
                    foo: 'bar'
                },
                MethodSettings: {
                    LoggingLevel: 'INFO',
                    MetricsEnabled: true
                }
            });
            pluginInstance = new ApiStagePlugin(serverless);
        });
        describe('When the `before:deploy:deploy` hook is executed', function () {
            beforeEach(function () {
                pluginInstance.hooks['before:deploy:deploy']();
            });
            it('Adds a stage resource to the CloudFormation template with specified variables and settings', function () {
                expect(serverless.service.provider.compiledCloudFormationTemplate.Resources.ApiGatewayStageTesting).to.deep.equal({
                    Type: 'AWS::ApiGateway::Stage',
                    Properties: {
                        StageName: 'testing',
                        Description: 'testing stage of service',
                        RestApiId: {
                            Ref: 'ApiGatewayRestApi'
                        },
                        DeploymentId: {
                            Ref: 'Deployment'
                        },
                        Variables: {
                            foo: 'bar'
                        },
                        MethodSettings: [
                            {
                                LoggingLevel: 'INFO',
                                DataTraceEnabled: true,
                                HttpMethod: '*',
                                ResourcePath: '/*',
                                MetricsEnabled: true
                            }
                        ]
                    }
                });
            });
            it('Removes the `StageName` property of the deployment resource', function () {
                expect(serverless.service.provider.compiledCloudFormationTemplate.Resources.Deployment.Properties.StageName).to.equal(undefined);
            });
            it('Logs messages', function () {
                expect(serverless.cli.log.calledTwice).to.equal(true);
            });
        });
    });
});