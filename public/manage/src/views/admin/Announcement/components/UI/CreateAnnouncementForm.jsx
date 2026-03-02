import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Icon,
} from "@chakra-ui/react";
import { Send } from "lucide-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const ONLY_VALID_CHARS = /^[A-Za-z\s]+$/;

const announcementSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .matches(ONLY_VALID_CHARS, "Title can only contain letters and spaces")
    .required("Title is required"),
  message: Yup.string()
    .trim()
    .matches(ONLY_VALID_CHARS, "Message can only contain letters and spaces")
    .required("Message is required"),
  start_date: Yup.string().nullable(),
  end_date: Yup.string().nullable(),
  file: Yup.mixed().nullable(),
  fileName: Yup.string().nullable(),
});

const CreateAnnouncementForm = ({
  onCreate,
  onUpdate,
  editingData,
  onCancel,
}) => {
  const initialValues = {
    title: editingData?.title || "",
    message: editingData?.message || "",
    start_date: editingData?.start_date || "",
    end_date: editingData?.end_date || "",
    file: null, // file object to send
    fileName: editingData?.attachment_url || "",
  };

  const handleSubmit = (values) => {
    if (editingData) {
      onUpdate(values, editingData.announcement_id, editingData);
    } else {
      onCreate(values);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={announcementSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, setFieldValue, values }) => (
          <Form>
            {/* TITLE */}
            <FormControl isInvalid={errors.title && touched.title}>
              <FormLabel fontWeight="medium">Title</FormLabel>
              <Field
                as={Input}
                name="title"
                placeholder="Enter announcement title"
                focusBorderColor="blue.500"
              />
              {errors.title && touched.title && (
                <Text color="red.500" fontSize="sm">
                  {errors.title}
                </Text>
              )}
            </FormControl>

            {/* MESSAGE */}
            <FormControl isInvalid={errors.message && touched.message}>
              <FormLabel fontWeight="medium">Message</FormLabel>
              <Field
                as={Textarea}
                name="message"
                placeholder="Enter announcement message"
                rows={6}
                resize="none"
                focusBorderColor="blue.500"
              />
              {errors.message && touched.message && (
                <Text color="red.500" fontSize="sm">
                  {errors.message}
                </Text>
              )}
            </FormControl>

            {/* START DATE */}
            <FormControl>
              <FormLabel fontWeight="medium">
                Start Date{" "}
                <Text as="span" color="gray.400">
                  (Optional)
                </Text>
              </FormLabel>
              <Field
                as={Input}
                type="date"
                name="start_date"
                focusBorderColor="blue.500"
              />
            </FormControl>

            {/* END DATE */}
            <FormControl>
              <FormLabel fontWeight="medium">
                End Date{" "}
                <Text as="span" color="gray.400">
                  (Optional)
                </Text>
              </FormLabel>
              <Field
                as={Input}
                type="date"
                name="end_date"
                focusBorderColor="blue.500"
              />
            </FormControl>

            {/* FILE UPLOAD */}
            <FormControl>
              <FormLabel fontWeight="medium">
                Attachment{" "}
                <Text as="span" color="gray.400">
                  (Optional)
                </Text>
              </FormLabel>

              <Input
                type="file"
                id="attachmentUpload"
                display="none"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFieldValue("file", file);
                    setFieldValue("fileName", file.name);
                  }
                }}
              />

              <Box
                borderWidth="2px"
                borderStyle="dashed"
                borderColor="gray.300"
                borderRadius="lg"
                p={4}
                bg="gray.50"
                cursor="pointer"
                onClick={() => document.getElementById("attachmentUpload").click()}
                textAlign="center"
                _hover={{ bg: "gray.100" }}
              >
                {!values.fileName ? (
                  <Text color="gray.400">📎 Click to upload an attachment</Text>
                ) : (
                  <Text color="gray.700" fontWeight="medium">
                    📎 {values.fileName}
                  </Text>
                )}
              </Box>
            </FormControl>

            {/* BUTTONS */}
            <HStack spacing={3} justify="flex-end" pt={4}>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                leftIcon={<Icon as={Send} boxSize={4} />}
                colorScheme="blue"
                type="submit"
              >
                {editingData ? "Update Announcement" : "Send Announcement"}
              </Button>
            </HStack>
          </Form>
        )}
      </Formik>
    </VStack>
  );
};

export default CreateAnnouncementForm;