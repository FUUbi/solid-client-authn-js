/*
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Required by TSyringe:
import "reflect-metadata";
import { StorageUtilityMock } from "@inrupt/solid-client-authn-core";
import { OidcHandlerMock } from "./__mocks__/IOidcHandler";
import { IssuerConfigFetcherMock } from "./__mocks__/IssuerConfigFetcher";
import OidcLoginHandler from "./OidcLoginHandler";
import {
  mockDefaultClient,
  mockDefaultClientRegistrar,
} from "./__mocks__/ClientRegistrar";

describe("OidcLoginHandler", () => {
  const defaultMocks = {
    storageUtility: StorageUtilityMock,
    oidcHandler: OidcHandlerMock,
    issuerConfigFetcher: IssuerConfigFetcherMock,
    clientRegistrar: mockDefaultClientRegistrar(),
  };
  function getInitialisedHandler(
    mocks: Partial<typeof defaultMocks> = defaultMocks
  ): OidcLoginHandler {
    return new OidcLoginHandler(
      mocks.storageUtility ?? defaultMocks.storageUtility,
      mocks.oidcHandler ?? defaultMocks.oidcHandler,
      mocks.issuerConfigFetcher ?? defaultMocks.issuerConfigFetcher,
      mocks.clientRegistrar ?? defaultMocks.clientRegistrar
    );
  }

  describe("canHandle", () => {
    it("cannot handle options without an issuer", async () => {
      const handler = getInitialisedHandler();
      await expect(
        handler.canHandle({
          sessionId: "mySession",
          tokenType: "DPoP",
          redirectUrl: "https://my.app/redirect",
        })
      ).resolves.toEqual(false);
    });

    it("cannot handle options without an redirect url", async () => {
      const handler = getInitialisedHandler();
      await expect(
        handler.canHandle({
          sessionId: "mySession",
          tokenType: "DPoP",
          oidcIssuer: "https://my.idp/",
        })
      ).resolves.toEqual(false);
    });

    it("can handle options with both a redirect url and an issuer", async () => {
      const handler = getInitialisedHandler();
      await expect(
        handler.canHandle({
          sessionId: "mySession",
          tokenType: "DPoP",
          oidcIssuer: "https://my.idp/",
          redirectUrl: "https://my.app/redirect",
        })
      ).resolves.toEqual(true);
    });
  });

  describe("handle", () => {
    it("throws if config misses an issuer", async () => {
      const handler = getInitialisedHandler();
      await expect(
        handler.handle({
          sessionId: "mySession",
          tokenType: "DPoP",
          redirectUrl: "https://my.app/redirect",
        })
      ).rejects.toThrow("OidcLoginHandler requires an OIDC issuer");
    });

    it("throws if config misses a redirect URL", async () => {
      const handler = getInitialisedHandler();
      await expect(
        handler.handle({
          sessionId: "mySession",
          tokenType: "DPoP",
          oidcIssuer: "https://my.idp/",
        })
      ).rejects.toThrow("OidcLoginHandler requires a redirect URL");
    });

    it("performs DCR if client ID and secret aren't specified", async () => {
      const { oidcHandler } = defaultMocks;
      const clientRegistrar = mockDefaultClientRegistrar();
      clientRegistrar.getClient = jest
        .fn()
        .mockResolvedValueOnce(mockDefaultClient());
      const handler = getInitialisedHandler({ oidcHandler, clientRegistrar });
      await handler.handle({
        sessionId: "mySession",
        oidcIssuer: "https://arbitrary.url",
        redirectUrl: "https://app.com/redirect",
        tokenType: "DPoP",
      });
      expect(clientRegistrar.getClient).toHaveBeenCalled();
    });

    it("does not perform DCR if client ID and secret are specified", async () => {
      const { oidcHandler } = defaultMocks;
      const clientRegistrar = mockDefaultClientRegistrar();
      clientRegistrar.getClient = jest
        .fn()
        .mockResolvedValueOnce(mockDefaultClient());
      const handler = getInitialisedHandler({ oidcHandler, clientRegistrar });
      await handler.handle({
        sessionId: "mySession",
        oidcIssuer: "https://arbitrary.url",
        redirectUrl: "https://app.com/redirect",
        clientId: "some pre-registered client id",
        clientSecret: "some pre-registered client secret",
        tokenType: "DPoP",
      });
      expect(clientRegistrar.getClient).not.toHaveBeenCalled();
    });
  });
});