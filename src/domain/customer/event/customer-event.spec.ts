import EventDispatcher from "../../@shared/event/event-dispatcher";
import Customer from "../entity/customer";
import Address from "../value-object/address";
import CustomerCreatedEvent from "./customer-created.event";
import CustomerAddressChangedEvent from "./customer-address-changed.event";
import EnviaConsoleLog1Handler from "./handler/envia-console-log-1.handler";
import EnviaConsoleLog2Handler from "./handler/envia-console-log-2.handler";
import EnviaConsoleLogHandler from "./handler/envia-console-log.handler";

describe("Customer domain events tests", () => {
  it("should register a CustomerCreatedEvent when a customer is created", () => {
    const customer = new Customer("1", "Customer 1");

    expect(customer.domainEvents.length).toBe(1);
    expect(customer.domainEvents[0]).toBeInstanceOf(CustomerCreatedEvent);
    expect(customer.domainEvents[0].eventData).toMatchObject({
      id: "1",
      name: "Customer 1",
    });
  });

  it("should register a CustomerAddressChangedEvent when address is changed", () => {
    const customer = new Customer("1", "Customer 1");
    customer.clearDomainEvents();

    const address = new Address("Street 1", 123, "13330-250", "São Paulo");
    customer.changeAddress(address);

    expect(customer.domainEvents.length).toBe(1);
    expect(customer.domainEvents[0]).toBeInstanceOf(CustomerAddressChangedEvent);
    expect(customer.domainEvents[0].eventData).toMatchObject({
      id: "1",
      name: "Customer 1",
      address: "Street 1, 123, 13330-250 São Paulo",
    });
  });

  it("should notify all handlers when CustomerCreatedEvent is dispatched", () => {
    const eventDispatcher = new EventDispatcher();
    const handler1 = new EnviaConsoleLog1Handler();
    const handler2 = new EnviaConsoleLog2Handler();

    const spyHandler1 = jest.spyOn(handler1, "handle");
    const spyHandler2 = jest.spyOn(handler2, "handle");

    eventDispatcher.register("CustomerCreatedEvent", handler1);
    eventDispatcher.register("CustomerCreatedEvent", handler2);

    const customer = new Customer("1", "Customer 1");
    const customerCreatedEvent = customer.domainEvents[0] as CustomerCreatedEvent;

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyHandler1).toHaveBeenCalled();
    expect(spyHandler2).toHaveBeenCalled();
  });

  it("should notify handler when CustomerAddressChangedEvent is dispatched", () => {
    const eventDispatcher = new EventDispatcher();
    const handler = new EnviaConsoleLogHandler();

    const spyHandler = jest.spyOn(handler, "handle");

    eventDispatcher.register("CustomerAddressChangedEvent", handler);

    const customer = new Customer("1", "Customer 1");
    customer.clearDomainEvents();

    const address = new Address("Street 1", 123, "13330-250", "São Paulo");
    customer.changeAddress(address);

    const customerAddressChangedEvent = customer.domainEvents[0] as CustomerAddressChangedEvent;

    eventDispatcher.notify(customerAddressChangedEvent);

    expect(spyHandler).toHaveBeenCalled();
  });

  it("should log correct messages for CustomerCreatedEvent handlers", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const eventDispatcher = new EventDispatcher();

    eventDispatcher.register("CustomerCreatedEvent", new EnviaConsoleLog1Handler());
    eventDispatcher.register("CustomerCreatedEvent", new EnviaConsoleLog2Handler());

    const customer = new Customer("1", "Customer 1");
    eventDispatcher.notify(customer.domainEvents[0] as CustomerCreatedEvent);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Esse é o primeiro console.log do evento: CustomerCreated"
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Esse é o segundo console.log do evento: CustomerCreated"
    );

    consoleSpy.mockRestore();
  });

  it("should log correct message for CustomerAddressChangedEvent handler", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const eventDispatcher = new EventDispatcher();

    eventDispatcher.register("CustomerAddressChangedEvent", new EnviaConsoleLogHandler());

    const customer = new Customer("1", "Customer 1");
    customer.clearDomainEvents();

    const address = new Address("Street 1", 123, "13330-250", "São Paulo");
    customer.changeAddress(address);

    eventDispatcher.notify(customer.domainEvents[0] as CustomerAddressChangedEvent);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Endereço do cliente: 1, Customer 1 alterado para: Street 1, 123, 13330-250 São Paulo"
    );

    consoleSpy.mockRestore();
  });
});
