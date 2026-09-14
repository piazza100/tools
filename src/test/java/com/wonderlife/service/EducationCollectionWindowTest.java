package com.wonderlife.service;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

class EducationCollectionWindowTest {
 @Test void initialBackfillCoversYear(){var today=LocalDate.of(2026,9,14);assertEquals(today.minusDays(365),EducationCollectionWindow.from(today,null));}
 @Test void longOutageDoesNotLoseMissedDates(){var today=LocalDate.of(2026,9,14);var last=LocalDate.of(2026,6,1);assertEquals(last.minusDays(7),EducationCollectionWindow.from(today,last));}
}
