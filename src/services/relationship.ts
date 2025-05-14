import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/**
 * Updates a relationship between two entities in Firebase.
 * This function is used to update bidirectional relationships between services and specialists.
 *
 * @param sourceCollection The source collection (e.g., "specialists")
 * @param sourceId The ID of the source document
 * @param sourceFieldName The field in the source that holds related IDs (e.g., "services")
 * @param targetCollection The target collection (e.g., "services")
 * @param targetId The ID of the target document
 * @param targetFieldName The field in the target that holds related IDs (e.g., "specialists")
 * @param operation "add" to add a relationship, "remove" to remove it
 */
export const updateRelationship = async (
  sourceCollection: string,
  sourceId: string,
  sourceFieldName: string,
  targetCollection: string,
  targetId: string,
  targetFieldName: string,
  operation: "add" | "remove",
): Promise<void> => {
  try {
    // Get the source document
    const sourceDocRef = doc(db, sourceCollection, sourceId);
    const sourceDoc = await getDoc(sourceDocRef);

    if (!sourceDoc.exists()) {
      console.error(
        `Source document ${sourceId} not found in ${sourceCollection}`,
      );
      return;
    }

    // Get the target document
    const targetDocRef = doc(db, targetCollection, targetId);
    const targetDoc = await getDoc(targetDocRef);

    if (!targetDoc.exists()) {
      console.error(
        `Target document ${targetId} not found in ${targetCollection}`,
      );
      return;
    }

    // Get the current relationships
    const sourceData = sourceDoc.data();
    const targetData = targetDoc.data();

    const sourceRelationships = sourceData[sourceFieldName] || [];
    const targetRelationships = targetData[targetFieldName] || [];

    // Update relationships based on operation
    if (operation === "add") {
      // Add the relationship if it doesn't exist
      if (!sourceRelationships.includes(targetId)) {
        await updateDoc(sourceDocRef, {
          [sourceFieldName]: [...sourceRelationships, targetId],
          updatedAt: Timestamp.now(),
        });
      }

      if (!targetRelationships.includes(sourceId)) {
        await updateDoc(targetDocRef, {
          [targetFieldName]: [...targetRelationships, sourceId],
          updatedAt: Timestamp.now(),
        });
      }
    } else if (operation === "remove") {
      // Remove the relationship if it exists
      if (sourceRelationships.includes(targetId)) {
        await updateDoc(sourceDocRef, {
          [sourceFieldName]: sourceRelationships.filter(
            (id: string) => id !== targetId,
          ),
          updatedAt: Timestamp.now(),
        });
      }

      if (targetRelationships.includes(sourceId)) {
        await updateDoc(targetDocRef, {
          [targetFieldName]: targetRelationships.filter(
            (id: string) => id !== sourceId,
          ),
          updatedAt: Timestamp.now(),
        });
      }
    }

    console.log(
      `Relationship ${operation === "add" ? "added" : "removed"} between ${sourceCollection}/${sourceId} and ${targetCollection}/${targetId}`,
    );
  } catch (error) {
    console.error(`Error updating relationship:`, error);
    throw error;
  }
};

/**
 * Updates relationships between a document and multiple related documents.
 * Used when a document's related IDs list changes.
 *
 * @param collection The collection of the main document
 * @param docId The ID of the main document
 * @param fieldName The field in the main doc that holds related IDs
 * @param oldRelatedIds The old list of related IDs
 * @param newRelatedIds The new list of related IDs
 * @param relatedCollection The collection of the related documents
 * @param relatedFieldName The field in the related docs that holds main doc IDs
 */
export const updateManyRelationships = async (
  collection: string,
  docId: string,
  fieldName: string,
  oldRelatedIds: string[],
  newRelatedIds: string[],
  relatedCollection: string,
  relatedFieldName: string,
): Promise<void> => {
  try {
    // Find IDs that were removed
    const removedIds = oldRelatedIds.filter(
      (id) => !newRelatedIds.includes(id),
    );

    // Find IDs that were added
    const addedIds = newRelatedIds.filter((id) => !oldRelatedIds.includes(id));

    // Update removed relationships
    for (const relatedId of removedIds) {
      await updateRelationship(
        collection,
        docId,
        fieldName,
        relatedCollection,
        relatedId,
        relatedFieldName,
        "remove",
      );
    }

    // Update added relationships
    for (const relatedId of addedIds) {
      await updateRelationship(
        collection,
        docId,
        fieldName,
        relatedCollection,
        relatedId,
        relatedFieldName,
        "add",
      );
    }
  } catch (error) {
    console.error(`Error updating many relationships:`, error);
    throw error;
  }
};
