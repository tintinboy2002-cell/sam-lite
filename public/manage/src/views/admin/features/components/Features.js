import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Checkbox } from '@chakra-ui/react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  FormFeedback,
} from 'reactstrap';
import TableContainer from 'components/common/TableContainer';
import { FeatureName, OrgName } from './FeaturesCol';
import httpInjectorService from 'services/http-injector.service';
import { Empty } from 'antd';
import { toast } from 'react-toastify';
import { DeleteIcon } from '@chakra-ui/icons';

const Features = () => {
  const [featurelist, setFeatureList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allSelected, setAllSelected] = useState(false);

  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [featureName, setFeatureName] = useState('');
  const [description, setDescription] = useState('');
  const [featureNameError, setFeatureNameError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [orgError, setOrgError] = useState(false);
  const [orgList, setOrgList] = useState([]);
  const [assignedFeatureOrg, setAssignedFeatureOrg] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState('');

  const toggleFeatureModal = () => {
    setFeatureModalOpen(!featureModalOpen);
    if (!featureModalOpen) {
      setFeatureName('');
      setDescription('');
      setFeatureNameError(false);
      setDescriptionError(false);
    }
  };

  const toggleOrgModal = () => {
    if (selectedUsers.length === 0) return;
    setOrgModalOpen(!orgModalOpen);
    if (!orgModalOpen) {
      setSelectedOrg('');
      setOrgError(false);
    }
  };

  const toggleAllSelection = () => {
    const featureids = featurelist.map((item) => item.feature_id);

    setSelectedUsers((prevSelectedUsers) => {
      if (allSelected) {
        return [];
      } else {
        return featureids;
      }
    });

    setAllSelected((prevAllSelected) => !prevAllSelected);
  };

  const toggleRowSelection = (id) => {
    setSelectedUsers((prevState) => {
      if (prevState.includes(id)) {
        return prevState.filter((rowId) => rowId !== id);
      } else {
        return [...prevState, id];
      }
    });
  };

  const columns = useMemo(
    () => [
      {
        Header: (
          <Checkbox
            colorScheme="purple"
            isChecked={allSelected}
            onChange={toggleAllSelection}
          />
        ),
        accessor: 'select',
        Cell: ({ row }) => (
          <Checkbox
            colorScheme="purple"
            isChecked={selectedUsers?.includes(row.original.feature_id)}
            onChange={() => toggleRowSelection(row.original.feature_id)}
          />
        ),
      },
      {
        Header: 'Feature Name',
        accessor: 'feature_name',
        disableFilters: true,
        Cell: (cellProps) => <FeatureName {...cellProps} />,
      },
      {
        Header: 'Organizations',
        accessor: 'org_name',
        disableFilters: true,
        Cell: (cellProps) => (
          <OrgName
            {...cellProps}
            assignedFeatureOrg={assignedFeatureOrg}
            onUnassign={deleteAssignedFeature}
          />
        ),
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        disableFilters: true,
        Cell: ({ row }) => (
          <Button colorScheme="red" size="sm">
            <DeleteIcon
              onClick={() => onOpenDeleteModal(row.original.feature_id)}
            />
          </Button>
        ),
      },
    ],
    [allSelected, selectedUsers, featurelist, assignedFeatureOrg],
  );

  const onOpenDeleteModal = (feature_id) => {
    setOpenDeleteModal(true);
    setSelectedFeatureId(feature_id);
  };

  const deleteAssignedFeature = async (feature_id, org_id) => {
    try {
      const payload = {
        feature_id,
        org_id,
      };
      const response = await httpInjectorService.deleteAssignedFeature(payload);

      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      }
      getAssignedFeatureOrg();
      getFeatureList();
    } catch (error) {
      toast.error(error.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      getAssignedFeatureOrg();
      getFeatureList();
    }
  };

  const getFeatureList = async () => {
    try {
      const response = await httpInjectorService.getFeatureList();
      if (response.status === 'success') {
        setFeatureList(response.data || []);
      } else {
        setFeatureList([]);
      }
    } catch (err) {
      setFeatureList([]);
    }
  };

  const getAssignedFeatureOrg = async () => {
    try {
      const response = await httpInjectorService.getAssignedFeatureOrg();
      if (response.status === 'success') {
        setAssignedFeatureOrg(response.data);
      } else {
        setAssignedFeatureOrg([]);
      }
    } catch (err) {
      setAssignedFeatureOrg([]);
    }
  };

  const getOrgList = async () => {
    try {
      const response = await httpInjectorService.listorganization();
      if (response.status === 'success') {
        setOrgList(response.data);
      } else {
        setOrgList([]);
      }
    } catch (err) {
      setOrgList([]);
    }
  };

  const deleteFeature = async () => {
    try {
      const payload = {
        feature_id: selectedFeatureId,
      };
      const response = await httpInjectorService.deleteFeature(payload);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        getOrgList();
        getAssignedFeatureOrg();
        getFeatureList();
        setOpenDeleteModal(false);
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        getOrgList();
        getAssignedFeatureOrg();
        getFeatureList();
        setOpenDeleteModal(false);
      }
    } catch (err) {
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      getOrgList();
      getAssignedFeatureOrg();
      getFeatureList();
      setOpenDeleteModal(false);
    }
  };

  const handleAddFeature = async () => {
    let valid = true;
    if (!featureName.trim()) {
      setFeatureNameError(true);
      valid = false;
    }
    if (!description.trim()) {
      setDescriptionError(true);
      valid = false;
    }
    if (!valid) return;

    try {
      const payload = {
        feature_name: featureName,
        description: description
      };
      const response = await httpInjectorService.addFeature(payload);
      if (response.status === 'success') {
        setFeatureModalOpen(false);
        setFeatureName('');
        setDescription('');
        getFeatureList();
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
      }
    } catch (error) {
      toast.error(error.message, {
        position: 'top-right',
        autoClose: 1000,
      });
    }
  };

  const handleAddOrganization = async () => {
    if (!selectedOrg.trim()) {
      setOrgError(true);
      return;
    }

    const selectedFeatureSites = featurelist
      .filter((feature) => selectedUsers.includes(feature.feature_id))
      .map((feature) => feature.feature_site);

    const featureSitePayload =
      selectedFeatureSites.length === 1
        ? selectedFeatureSites[0]
        : selectedFeatureSites;

    try {
      const payload = {
        org_id: selectedOrg,
        features: selectedUsers
      };
      const response = await httpInjectorService.assignFeature(payload);
      if (response.status === 'success') {
        toast.success(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setOrgModalOpen(false);
        setSelectedOrg('');
        getFeatureList();
        setAllSelected(false);
        setSelectedUsers([]);
        getAssignedFeatureOrg();
      } else {
        toast.error(response.message, {
          position: 'top-right',
          autoClose: 1000,
        });
        setOrgModalOpen(false);
        setSelectedOrg('');
        getFeatureList();
        setAllSelected(false);
        setSelectedUsers([]);
        getAssignedFeatureOrg();
      }
    } catch (error) {
      toast.error(error.message, {
        position: 'top-right',
        autoClose: 1000,
      });
      setOrgModalOpen(false);
      setSelectedOrg('');
      getFeatureList();
      setAllSelected(false);
      setSelectedUsers([]);
      getAssignedFeatureOrg();
    }
  };

  useEffect(() => {
    getFeatureList();
    getOrgList();
    getAssignedFeatureOrg();
  }, []);

  return (
    <React.Fragment>
      <Card
        className="shadow p-3 bg-white rounded"
        style={{ marginTop: '80px' }}
      >
        <CardHeader>
          <h5>Feature List</h5>
        </CardHeader>
        <CardBody>
          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}
          >
            <Button
              rounded="2"
              size="sm"
              colorScheme="purple"
              onClick={toggleFeatureModal}
            >
              Add Feature
            </Button>
            <Button
              rounded="2"
              size="sm"
              colorScheme="purple"
              onClick={toggleOrgModal}
              isDisabled={selectedUsers.length === 0}
            >
              Add Organization
            </Button>
          </div>
          {featurelist.length === 0 ? (
            <div>
              <Empty />
            </div>
          ) : (
            <div>
              <TableContainer
                columns={columns}
                data={featurelist}
                isGlobalFilter={true}
                customPageSize={10}
                className="custom-header-css"
              />
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={featureModalOpen} toggle={toggleFeatureModal}>
        <ModalHeader toggle={toggleFeatureModal}>Add New Feature</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="featureName">
              Feature Name<span className="text-danger">*</span>
            </Label>
            <Input
              id="featureName"
              type="text"
              placeholder="Enter feature name"
              value={featureName}
              onChange={(e) => {
                setFeatureName(e.target.value);
                if (featureNameError && e.target.value.trim())
                  setFeatureNameError(false);
              }}
              invalid={featureNameError}
            />
            {featureNameError && (
              <FormFeedback>Please enter feature name.</FormFeedback>
            )}
          </FormGroup>

          <FormGroup>
            <Label for="description">
              Description<span className="text-danger">*</span>
            </Label>
            <Input
              id="description"
              type="textarea"
              placeholder="Enter description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (descriptionError && e.target.value.trim())
                  setDescriptionError(false);
              }}
              invalid={descriptionError}
            />
            {descriptionError && (
              <FormFeedback>Please enter description.</FormFeedback>
            )}
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="red"
            rounded="2"
            size="sm"
            mr={3}
            onClick={toggleFeatureModal}
          >
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            rounded="2"
            size="sm"
            onClick={handleAddFeature}
          >
            Add Feature
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={orgModalOpen} toggle={toggleOrgModal}>
        <ModalHeader toggle={toggleOrgModal}>Add Organization</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="organization">
              Select Organization<span className="text-danger">*</span>
            </Label>
            <Input
              id="organization"
              type="select"
              value={selectedOrg}
              onChange={(e) => {
                setSelectedOrg(e.target.value);
                if (orgError && e.target.value.trim()) setOrgError(false);
              }}
              invalid={orgError}
            >
              <option value="">-- Select Organization --</option>
              {orgList.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.org_name}
                </option>
              ))}
            </Input>
            {orgError && (
              <FormFeedback>Please select an organization.</FormFeedback>
            )}
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="red"
            size="sm"
            rounded="2"
            mr={3}
            onClick={toggleOrgModal}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            colorScheme="purple"
            rounded="2"
            onClick={handleAddOrganization}
          >
            Add Organization
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        size="md"
        isOpen={openDeleteModal}
        toggle={() => setOpenDeleteModal(false)}
      >
        <ModalHeader toggle={() => setOpenDeleteModal(false)}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>Are you sure you want to delete feature ?</ModalBody>
        <ModalFooter>
          <Button
            rounded="3"
            onClick={() => setOpenDeleteModal(false)}
            colorScheme="red"
          >
            No
          </Button>
          <Button onClick={deleteFeature} rounded="3" colorScheme="purple">
            Yes
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default Features;
