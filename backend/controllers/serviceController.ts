import { Response } from 'express';
import Service from '../models/Service';
import ServiceRequest, { RequestStatus } from '../models/ServiceRequest';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const serviceData = {
      ...req.body,
      providerId: req.user!.id,
      createdAt: new Date()
    };
    const service = await Service.create(serviceData);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
};

export const getAllServices = async (req: AuthRequest, res: Response) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

export const getMyServices = async (req: AuthRequest, res: Response) => {
  try {
    const services = await Service.findAll({ where: { providerId: req.user!.id } });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your services' });
  }
};

export const requestService = async (req: AuthRequest, res: Response) => {
  try {
    const { serviceId, details, date } = req.body;
    const service = await Service.findByPk(serviceId);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const requestData = {
      serviceId,
      customerId: req.user!.id,
      providerId: service.providerId,
      status: RequestStatus.PENDING,
      details,
      date,
      createdAt: new Date()
    };

    const serviceRequest = await ServiceRequest.create(requestData);

    // Notify the provider and customer
    const provider = await User.findByPk(service.providerId);
    if (provider) {
      NotificationService.notifyProviderAboutRequest(provider, service, req.user!).catch(console.error);
    }
    NotificationService.notifyCustomerAboutRequestConfirmation(req.user!, service).catch(console.error);

    res.status(201).json(serviceRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to request service' });
  }
};

export const getProviderRequests = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await ServiceRequest.findAll({ where: { providerId: req.user!.id } });
    
    // Join with service details and customer details
    const services = await Service.findAll();
    const users = await User.findAll();

    const enhancedRequests = requests.map((r: any) => ({
      ...r,
      Service: services.find((s: any) => s.id === r.serviceId),
      Customer: users.find((u: any) => u.id === r.customerId)
    }));

    res.json(enhancedRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updated = await ServiceRequest.update({ status }, { where: { id } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request' });
  }
};
